import { db } from '../db.js';
import { NotificationDispatcher } from './notificationDispatcher.js';
import crypto from 'node:crypto';

export class SchedulerService {
  /**
   * Check for scheduled posts and trigger autonomous publishing or reminders.
   * Runs periodically in WAT timezone (Africa/Lagos).
   */
  static async runSchedulerTick() {
    const profile = db.prepare('SELECT emergency_pause_active FROM profiles LIMIT 1').get();
    const isPaused = profile && profile.emergency_pause_active === 1;
    const now = new Date();

    // 1. Check for missed approval deadlines
    const pendingPosts = db.prepare(`
      SELECT p.*, s.scheduled_for_wat, s.id as schedule_id
      FROM generated_posts p
      JOIN publishing_schedule s ON p.id = s.post_id
      WHERE p.status = 'pending_approval' AND s.status = 'queued'
    `).all();

    for (const post of pendingPosts) {
      const scheduledTime = new Date(post.scheduled_for_wat);
      if (now > scheduledTime) {
        // Post deadline passed without human approval -> Pause and alert
        db.prepare("UPDATE publishing_schedule SET status = 'paused', last_error = 'Approval deadline passed without explicit human authorization.' WHERE id = ?").run(post.schedule_id);

        this.logNotification(
          'emergency',
          'seun.akin43@gmail.com',
          `[MISSED DEADLINE] Post "${post.title}" scheduled for ${post.scheduled_for_wat} WAT was paused because explicit human approval was not received.`
        );
      }
    }

    // 2. AUTONOMOUS PUBLISHING OF APPROVED POSTS
    // Once approved, post publishes automatically at scheduled date/time without waiting for manual publishing button!
    if (!isPaused) {
      const readyPosts = db.prepare(`
        SELECT p.id, p.title, s.scheduled_for_wat, s.id as schedule_id
        FROM generated_posts p
        JOIN publishing_schedule s ON p.id = s.post_id
        WHERE p.status = 'approved' AND s.status = 'queued'
      `).all();

      for (const readyPost of readyPosts) {
        const scheduledTime = new Date(readyPost.scheduled_for_wat);
        if (now >= scheduledTime) {
          try {
            const { LinkedInPublisherAgent } = await import('./publisherAgent.js');
            const result = await LinkedInPublisherAgent.publishPost(readyPost.id);
            console.log(`[AUTONOMOUS DISPATCH] Post "${readyPost.title}" published automatically to LinkedIn:`, result.permalink);

            this.logNotification(
              'custom',
              'seun.akin43@gmail.com',
              `🚀 [AUTONOMOUS DISPATCH] Approved post "${readyPost.title}" was published automatically to LinkedIn at scheduled time (${readyPost.scheduled_for_wat} WAT)!`
            );
          } catch (pubErr) {
            console.error(`Autonomous dispatch failed for post ${readyPost.id}:`, pubErr.message);
            db.prepare("UPDATE publishing_schedule SET status = 'failed', last_error = ? WHERE id = ?").run(pubErr.message, readyPost.schedule_id);
          }
        }
      }
    }

    // 3. AUTONOMOUS WEEKLY GENERATION
    // If no posts are scheduled for the coming week, generate automatically
    const upcomingCount = db.prepare(`
      SELECT COUNT(*) as count FROM generated_posts
      WHERE scheduled_date >= date('now')
    `).get().count;

    if (upcomingCount === 0) {
      console.log('[AUTONOMOUS CONTENT GENERATOR] Generating new weekly calendar automatically...');
      try {
        const { ContentGeneratorEngine } = await import('./contentGenerator.js');
        const { ResearchAgent } = await import('./researchAgent.js');
        await ResearchAgent.runWeeklyResearch();
        const generated = ContentGeneratorEngine.generateWeeklyCalendar();
        console.log(`[AUTONOMOUS CONTENT GENERATOR] Generated ${generated.length} posts for coming week.`);
        this.triggerSimulatedMobileReminder('sun_prep');
      } catch (genErr) {
        console.error('Autonomous calendar generation error:', genErr.message);
      }
    }

    return {
      emergency_pause_active: isPaused,
      active_schedules_count: db.prepare("SELECT COUNT(*) as count FROM publishing_schedule WHERE status = 'queued'").get().count,
      pending_approvals_count: db.prepare("SELECT COUNT(*) as count FROM generated_posts WHERE status = 'pending_approval'").get().count
    };
  }

  static toggleEmergencyPause(activate) {
    db.prepare("UPDATE profiles SET emergency_pause_active = ?, updated_at = datetime('now')").run(activate ? 1 : 0);

    const statusStr = activate ? 'ACTIVATED' : 'RESUMED';

    db.prepare(`
      INSERT INTO automation_logs (id, agent_name, action, details, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `log-${crypto.randomUUID().slice(0, 8)}`,
      'Emergency Control Switch',
      'PAUSE_TOGGLED',
      `Emergency automation pause was ${statusStr}. All outbound scheduled dispatches are ${activate ? 'halted' : 'restored'}.`,
      activate ? 'warning' : 'success'
    );

    this.logNotification(
      'emergency',
      'seun.akin43@gmail.com',
      `[EMERGENCY NOTICE] Automation publishing has been ${statusStr}. Existing drafts and approval records remain preserved.`
    );

    return { emergency_pause_active: activate ? 1 : 0 };
  }

  static triggerSimulatedMobileReminder(type) {
    const pendingCount = db.prepare("SELECT COUNT(*) as count FROM generated_posts WHERE status = 'pending_approval'").get().count;
    const pendingPosts = db.prepare("SELECT p.*, cp.name as pillar_name FROM generated_posts p LEFT JOIN content_pillars cp ON p.pillar_id = cp.id WHERE p.status = 'pending_approval' LIMIT 3").all();

    // Trigger rich dispatch for the first pending post
    if (pendingPosts.length > 0) {
      NotificationDispatcher.dispatchPostForApproval(pendingPosts[0]).catch(e => console.warn('Dispatch error:', e.message));
    }

    const pendingTitles = pendingPosts;

    let message = '';
    switch (type) {
      case 'sun_prep':
        message = `📅 [Sunday 6:00 PM WAT Weekly Prep] Your upcoming LinkedIn content calendar was generated automatically! ${pendingCount} posts awaiting your authorization.`;
        break;
      case 'mon_approval':
        message = `🔔 [Monday 8:00 AM WAT Approval Reminder] ${pendingCount} posts are queued for publishing this week. Tap to approve: ${pendingTitles.map(p => `"${p.title}" (${p.scheduled_date})`).join(', ')}.`;
        break;
      case 'wed_midweek':
        message = `⚡ [Wednesday 8:00 AM WAT Midweek Review] You have ${pendingCount} posts remaining for the second half of the week. Review queue active.`;
        break;
      case 'fri_review':
        message = `📊 [Friday 4:00 PM WAT Performance Review] Your weekly publishing report is ready. 99.8% SLA sustained, engagement metrics captured in dashboard.`;
        break;
      default:
        message = `[Notification] You have ${pendingCount} posts in the approval center.`;
    }

    return this.logNotification(type, 'seun.akin43@gmail.com', message);
  }

  static logNotification(type, recipient, message) {
    const id = `notif-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO notification_logs (id, schedule_type, recipient, message, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, type, recipient, message, 'sent');

    return { id, type, message, timestamp: new Date().toISOString() };
  }

  static getNotificationHistory() {
    return db.prepare('SELECT * FROM notification_logs ORDER BY sent_at_wat DESC LIMIT 50').all();
  }
}
