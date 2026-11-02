import { db } from '../db.js';
import crypto from 'node:crypto';
import os from 'node:os';

export class NotificationDispatcher {
  /**
   * Retrieves the current base URL for mobile access.
   * Priority:
   * 1. PUBLIC_APP_URL environment variable (e.g. Cloudflare / Ngrok / Railway URL)
   * 2. Local Wi-Fi IPv4 address (e.g. http://192.168.1.77:3001)
   * 3. Fallback http://localhost:3001
   */
  static getBaseUrl() {
    if (process.env.PUBLIC_APP_URL) {
      return process.env.PUBLIC_APP_URL.replace(/\/+$/, '');
    }

    try {
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal && !name.includes('VMware') && !name.includes('Loopback')) {
            return `http://${iface.address}:3001`;
          }
        }
      }
    } catch (e) {
      // Fallback
    }

    return 'http://localhost:3001';
  }

  /**
   * Dispatches an approval notification across all active channels:
   * 1. Formatted HTML Email (Gmail & Gemini Mobile App Extension compatible)
   * 2. Telegram Bot with Interactive Inline Buttons (if configured)
   * 3. Make.com Webhook (for WhatsApp / SMS, if configured)
   * 4. Persistent SQLite notification logs
   */
  static async dispatchPostForApproval(post) {
    const baseUrl = this.getBaseUrl();
    const approveUrl = `${baseUrl}/api/quick-approve?id=${post.id}&action=approved`;
    const rejectUrl = `${baseUrl}/api/quick-approve?id=${post.id}&action=rejected`;
    const reviewUrl = `${baseUrl}/api/mobile-review?id=${post.id}`;
    const imageUrl = post.image_url ? `${baseUrl}${post.image_url}` : null;

    const subject = `🔔 [Action Required] LinkedIn Post Ready: "${post.title}"`;
    const summaryText = `Post scheduled for ${post.scheduled_date} at ${post.scheduled_time_wat} WAT.\n\nOpening Hook:\n"${post.hook}"\n\nTap to approve on your phone:\n${approveUrl}\n\nReview full post & graphic:\n${reviewUrl}`;

    const dispatchResults = {
      post_id: post.id,
      base_url: baseUrl,
      review_url: reviewUrl,
      approve_url: approveUrl,
      reject_url: rejectUrl,
      channels: {}
    };

    // 1. Persistent Log Entry in SQLite
    const notifId = `notif-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO notification_logs (id, schedule_type, recipient, message, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      notifId,
      'mon_approval',
      'seun.akin43@gmail.com',
      `[APPROVAL READY] "${post.title}" - Review: ${reviewUrl} | 1-Tap Approve: ${approveUrl}`,
      'sent'
    );
    dispatchResults.channels.sqlite_log = { status: 'recorded', id: notifId };

    // 2. Telegram Bot Dispatch (if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are provided)
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const tgMsg = `🚀 *LinkedIn Post Awaiting Approval*\n\n*Title:* ${post.title}\n*Scheduled:* ${post.scheduled_date} @ ${post.scheduled_time_wat} WAT\n*Format:* ${post.content_format || 'Thought Leadership'}\n\n*Hook:*\n_${post.hook.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&')}_\n\nTap a button below to authorize or review on your phone:`;
        
        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: '✅ Approve Post', url: approveUrl },
              { text: '❌ Reject', url: rejectUrl }
            ],
            [
              { text: '📱 Open Full Mobile Review', url: reviewUrl }
            ]
          ]
        };

        const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: tgMsg,
            parse_mode: 'MarkdownV2',
            reply_markup: inlineKeyboard
          })
        });
        const tgData = await tgRes.json();
        dispatchResults.channels.telegram = { status: tgData.ok ? 'sent' : 'failed', response: tgData };
      } catch (tgErr) {
        dispatchResults.channels.telegram = { status: 'error', error: tgErr.message };
      }
    } else {
      dispatchResults.channels.telegram = { status: 'unconfigured', note: 'Set TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID in .env to receive interactive Telegram cards.' };
    }

    // 3. Make.com / WhatsApp Webhook Dispatch (if MAKE_WEBHOOK_URL is provided)
    if (process.env.MAKE_WEBHOOK_URL) {
      try {
        const makeRes = await fetch(process.env.MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'POST_APPROVAL_REQUIRED',
            postId: post.id,
            title: post.title,
            hook: post.hook,
            scheduledDate: post.scheduled_date,
            scheduledTimeWAT: post.scheduled_time_wat,
            approveUrl,
            rejectUrl,
            reviewUrl,
            imageUrl,
            recipientPhone: '+234 813 589 8224'
          })
        });
        dispatchResults.channels.make_webhook = { status: makeRes.ok ? 'dispatched' : 'failed', statusCode: makeRes.status };
      } catch (makeErr) {
        dispatchResults.channels.make_webhook = { status: 'error', error: makeErr.message };
      }
    } else {
      dispatchResults.channels.make_webhook = { status: 'unconfigured', note: 'Set MAKE_WEBHOOK_URL in .env to forward approvals to WhatsApp via Make.com.' };
    }

    // 4. HTML Email Payload (for Gmail & Google Gemini Workspace Extension)
    dispatchResults.email_payload = {
      to: 'seun.akin43@gmail.com',
      subject,
      text: summaryText,
      html: this.generateApprovalEmailHtml(post, { approveUrl, rejectUrl, reviewUrl, imageUrl })
    };

    return dispatchResults;
  }

  /**
   * Generates a modern, mobile-responsive HTML email template with high-contrast
   * 1-tap Approve and Reject buttons that work seamlessly on Gmail and the Google Gemini App.
   */
  static generateApprovalEmailHtml(post, { approveUrl, rejectUrl, reviewUrl, imageUrl }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Post Approval</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090D16; color: #F8FAFC;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #0F172A; border: 1px solid #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0284C7, #0F172A); padding: 24px 20px; text-align: center; border-bottom: 1px solid #1E293B;">
      <span style="display: inline-block; padding: 4px 12px; background-color: rgba(255,255,255,0.15); border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #38BDF8; text-transform: uppercase;">Action Required · Phone Approval</span>
      <h1 style="margin: 12px 0 4px; font-size: 22px; color: #FFFFFF; font-weight: 800;">LinkedIn Post Ready for Review</h1>
      <p style="margin: 0; font-size: 13px; color: #94A3B8;">Toluwanimi Akinyemi · Personal Branding Automation</p>
    </div>

    <!-- Body Content -->
    <div style="padding: 24px 20px;">
      
      <!-- Meta Badge Row -->
      <div style="margin-bottom: 16px;">
        <span style="display: inline-block; padding: 4px 10px; background-color: #082F49; color: #38BDF8; border: 1px solid #0284C7; border-radius: 6px; font-size: 12px; font-weight: 700; margin-right: 8px;">
          ${post.pillar_name || 'Telecommunications & AI'}
        </span>
        <span style="font-size: 12px; color: #94A3B8;">
          ⏰ Scheduled: <strong>${post.scheduled_date} @ ${post.scheduled_time_wat} WAT</strong>
        </span>
      </div>

      <!-- Post Title -->
      <h2 style="font-size: 18px; color: #FFFFFF; margin: 0 0 16px; line-height: 1.4;">
        ${post.title}
      </h2>

      <!-- Hook Box -->
      <div style="background-color: #1E293B; border-left: 4px solid #38BDF8; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <span style="display: block; font-size: 11px; font-weight: 700; color: #38BDF8; text-transform: uppercase; margin-bottom: 4px;">Opening Hook:</span>
        <p style="margin: 0; font-size: 14px; color: #F1F5F9; line-height: 1.5; white-space: pre-line;">${post.hook}</p>
      </div>

      <!-- Attached Graphic Banner (if available) -->
      ${imageUrl ? `
      <div style="margin-bottom: 20px; text-align: center; background-color: #020617; padding: 12px; border-radius: 12px; border: 1px solid #1E293B;">
        <span style="display: block; font-size: 11px; color: #64748B; margin-bottom: 8px; font-weight: 600;">ATTACHED DISTINCT GRAPHIC:</span>
        <img src="${imageUrl}" alt="Post Visual Graphic" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
      </div>
      ` : ''}

      <!-- 1-TAP ACTION BUTTONS (MOBILE FRIENDLY) -->
      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #1E293B; text-align: center;">
        <p style="font-size: 12px; color: #94A3B8; margin: 0 0 16px;">Tap directly from your phone to authorize or review:</p>
        
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
          <tr>
            <td align="center" style="padding-right: 6px;">
              <a href="${approveUrl}" style="display: block; padding: 14px 20px; background-color: #059669; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(5,150,105,0.4);">
                ✅ Approve &amp; Auto-Publish
              </a>
            </td>
            <td align="center" style="padding-left: 6px;">
              <a href="${rejectUrl}" style="display: block; padding: 14px 20px; background-color: #881337; color: #FDA4AF; text-decoration: none; font-size: 14px; font-weight: 800; border-radius: 12px; text-align: center; border: 1px solid #BE123C;">
                ❌ Reject
              </a>
            </td>
          </tr>
        </table>

        <a href="${reviewUrl}" style="display: inline-block; margin-top: 8px; font-size: 13px; color: #38BDF8; text-decoration: underline;">
          📱 Open Full Mobile Review Page →
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #070B14; padding: 16px 20px; text-align: center; border-top: 1px solid #1E293B; font-size: 11px; color: #64748B;">
      This email was generated by your Autonomous LinkedIn Personal Branding Platform.<br>
      To ask Gemini on your phone: <em>"Hey Gemini, summarize my LinkedIn post approvals"</em>.
    </div>

  </div>
</body>
</html>
    `.trim();
  }
}
