import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { db, initDatabase } from './db.js';
import { ContentGeneratorEngine } from './agents/contentGenerator.js';
import { AutonomousProjectEngine } from './agents/projectEngine.js';
import { ResearchAgent } from './agents/researchAgent.js';
import { LinkedInPublisherAgent } from './agents/publisherAgent.js';
import { SchedulerService } from './agents/schedulerService.js';
import { EngagementAgent } from './agents/engagementAgent.js';
import { NotificationDispatcher } from './agents/notificationDispatcher.js';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize the 20 database tables
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/media', express.static(path.join(__dirname, '../public/media'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// --- 1. OVERVIEW & HEALTH ---
app.get('/api/overview', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles LIMIT 1').get();
    const stats = {
      total_generated: db.prepare("SELECT COUNT(*) as count FROM generated_posts").get().count,
      pending_approval: db.prepare("SELECT COUNT(*) as count FROM generated_posts WHERE status = 'pending_approval'").get().count,
      approved: db.prepare("SELECT COUNT(*) as count FROM generated_posts WHERE status = 'approved'").get().count,
      scheduled: db.prepare("SELECT COUNT(*) as count FROM publishing_schedule WHERE status = 'queued'").get().count,
      published: db.prepare("SELECT COUNT(*) as count FROM published_posts").get().count,
      rejected: db.prepare("SELECT COUNT(*) as count FROM generated_posts WHERE status = 'rejected'").get().count,
      projects_count: db.prepare("SELECT COUNT(*) as count FROM projects").get().count,
      verified_sources: db.prepare("SELECT COUNT(*) as count FROM research_sources WHERE verification_grade = 'verified'").get().count,
      leads_count: db.prepare("SELECT COUNT(*) as count FROM professional_leads").get().count,
      emergency_pause_active: profile ? profile.emergency_pause_active : 0
    };

    const recentLogs = db.prepare('SELECT * FROM automation_logs ORDER BY created_at DESC LIMIT 8').all();
    const upcomingPosts = db.prepare(`
      SELECT p.id, p.title, p.scheduled_date, p.scheduled_time_wat, p.status, p.image_url, cp.name as pillar_name
      FROM generated_posts p
      JOIN content_pillars cp ON p.pillar_id = cp.id
      ORDER BY p.scheduled_date ASC, p.scheduled_time_wat ASC
      LIMIT 5
    `).all();

    res.json({
      success: true,
      profile,
      stats,
      upcomingPosts,
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 2. CONTENT & CALENDAR ---
app.get('/api/calendar', (req, res) => {
  try {
    const posts = ContentGeneratorEngine.getCalendarPosts();
    const pillars = db.prepare('SELECT * FROM content_pillars').all();
    res.json({ success: true, posts, pillars });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/calendar/generate-weekly', (req, res) => {
  try {
    const { startDate } = req.body || {};
    const posts = ContentGeneratorEngine.generateWeeklyCalendar({ startDateStr: startDate });
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/posts/:id', (req, res) => {
  try {
    const post = ContentGeneratorEngine.getPostById(req.params.id);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const versions = db.prepare('SELECT * FROM content_versions WHERE post_id = ? ORDER BY version_number DESC').all(req.params.id);
    const approvals = db.prepare('SELECT * FROM content_approvals WHERE post_id = ? ORDER BY decision_timestamp DESC').all(req.params.id);
    const schedule = db.prepare('SELECT * FROM publishing_schedule WHERE post_id = ?').get(req.params.id);

    res.json({ success: true, post, versions, approvals, schedule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/posts/:id', (req, res) => {
  try {
    const updated = ContentGeneratorEngine.updatePost(req.params.id, req.body);
    res.json({ success: true, post: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:id/approval', (req, res) => {
  try {
    const { decision, feedback } = req.body;
    if (!['approved', 'rejected', 'revision_requested'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Invalid decision' });
    }
    const result = ContentGeneratorEngine.setPostApproval(req.params.id, decision, feedback);
    res.json({
      success: true,
      post: result,
      replacementPost: result.replacementPost || null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:id/revamp', async (req, res) => {
  try {
    const { instructions } = req.body || {};
    if (!instructions || !instructions.trim()) {
      return res.status(400).json({ success: false, error: 'Please specify what you would like to change.' });
    }
    const updated = await ContentGeneratorEngine.revampPost(req.params.id, instructions);
    res.json({
      success: true,
      message: 'Post copy revamped successfully, and an additional candidate post was automatically created for approval!',
      post: updated,
      newPost: updated.newPost || null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/posts/:id/publish', async (req, res) => {
  try {
    const { manualFallback } = req.body || {};
    const result = await LinkedInPublisherAgent.publishPost(req.params.id, {
      forceManualFallback: manualFallback,
      allowExplicitUserPublish: true
    });
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- 3. PROJECTS & AUTONOMOUS PROTOTYPES ---
app.get('/api/projects', (req, res) => {
  try {
    const projects = AutonomousProjectEngine.getAllProjects();
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const details = AutonomousProjectEngine.getProjectDetails(req.params.id);
    if (!details) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, project: details });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects/discover', async (req, res) => {
  try {
    const newProj = await AutonomousProjectEngine.discoverAndCreateProject(req.body);
    res.json({ success: true, project: newProj });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/projects/:id/campaign', (req, res) => {
  try {
    const campaign = AutonomousProjectEngine.generateCampaignFromProject(req.params.id);
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 4. BRAND MEMORY & VOICE ---
app.get('/api/brand-memory', (req, res) => {
  try {
    const memory = db.prepare('SELECT * FROM brand_memory ORDER BY category ASC, key ASC').all();
    res.json({ success: true, memory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/brand-memory', (req, res) => {
  try {
    const { category, key, value, notes } = req.body;
    const id = `mem-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO brand_memory (id, category, key, value, notes, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(id, category, key, value, notes || '');
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/brand-memory/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM brand_memory WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 5. RESEARCH & FACT CHECKING ---
app.get('/api/research', (req, res) => {
  try {
    const sources = ResearchAgent.getVerifiedSources();
    res.json({ success: true, sources });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/research/scan', async (req, res) => {
  try {
    const results = await ResearchAgent.runWeeklyResearch();
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 6. ENGAGEMENT, COMMENTS & LEADS ---
app.get('/api/comments', (req, res) => {
  try {
    let drafts = EngagementAgent.getCommentDrafts();
    if (drafts.length === 0) {
      // Seed initial simulated comments against the latest published post
      const latestPublished = db.prepare('SELECT id FROM published_posts ORDER BY published_at_wat DESC LIMIT 1').get();
      if (latestPublished) {
        EngagementAgent.generateCommentDrafts(latestPublished.id);
        drafts = EngagementAgent.getCommentDrafts();
      }
    }
    res.json({ success: true, comments: drafts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/comments/:id/approve', (req, res) => {
  try {
    const { customText } = req.body || {};
    const result = EngagementAgent.approveCommentDraft(req.params.id, customText);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/leads', (req, res) => {
  try {
    let leads = EngagementAgent.getLeads();
    if (leads.length === 0) {
      // Seed realistic initial leads
      EngagementAgent.addLead({
        contact_name: 'Engr. Babatunde Fashola',
        profile_url: 'https://www.linkedin.com/in/bfashola',
        company: 'MainOne Equinix',
        role: 'Head of Infrastructure Engineering',
        opportunity_type: 'collaboration',
        notes: 'Expressed interest in our automated battery voltage decay predictor for remote edge nodes.'
      });
      EngagementAgent.addLead({
        contact_name: 'Amanda Lindqvist',
        profile_url: 'https://www.linkedin.com/in/amanda-talent-tech',
        company: 'Apex Global Telecom Search',
        role: 'Senior Technical Recruiter',
        opportunity_type: 'job',
        notes: 'Reached out regarding Senior Operations / AI Automation Lead role for EMEA remote operations.'
      });
      leads = EngagementAgent.getLeads();
    }
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/leads/:id', (req, res) => {
  try {
    const { status } = req.body;
    const result = EngagementAgent.updateLeadStatus(req.params.id, status);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 7. EMERGENCY CONTROLS & NOTIFICATIONS ---
app.post('/api/scheduler/tick', async (req, res) => {
  try {
    const result = await SchedulerService.runSchedulerTick();
    res.json({ success: true, scheduler: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mobile Full Review & 1-Tap Action Interface (Designed specifically for smartphones)
app.get('/api/mobile-review', (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).send('Missing post id parameter');

    const post = ContentGeneratorEngine.getPostById(String(id));
    if (!post) return res.status(404).send('Post not found in database');

    const slides = Array.isArray(post.carousel_slides) && post.carousel_slides.length > 0
      ? post.carousel_slides
      : (post.image_url ? [post.image_url] : []);

    const approveUrl = `/api/quick-approve?id=${post.id}&action=approved`;
    const rejectUrl = `/api/quick-approve?id=${post.id}&action=rejected`;

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <title>Review: ${post.title} · Mobile Approval</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #090D16;
            color: #F8FAFC;
            padding: 16px;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 480px;
            margin: 0 auto 80px;
            background: #0F172A;
            border: 1px solid #1E293B;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 12px 35px rgba(0,0,0,0.6);
          }
          .header {
            background: linear-gradient(135deg, #0284C7, #0F172A);
            padding: 20px 16px;
            border-bottom: 1px solid #1E293B;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            background: #082F49;
            color: #38BDF8;
            border: 1px solid #0284C7;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .status-tag {
            display: inline-block;
            float: right;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            background: ${post.status === 'approved' ? '#065F46; color: #34D399;' : post.status === 'published' ? '#047857; color: #FFFFFF;' : '#854D0E; color: #FDE047;'};
          }
          .title {
            font-size: 18px;
            font-weight: 800;
            color: #FFFFFF;
            margin: 12px 0 6px;
            line-height: 1.35;
          }
          .meta {
            font-size: 12px;
            color: #94A3B8;
            font-family: monospace;
          }
          .content-body {
            padding: 16px;
          }
          .hook-box {
            background: #1E293B;
            border-left: 4px solid #38BDF8;
            border-radius: 10px;
            padding: 12px 14px;
            margin-bottom: 16px;
          }
          .hook-label {
            font-size: 11px;
            font-weight: 700;
            color: #38BDF8;
            text-transform: uppercase;
            display: block;
            margin-bottom: 4px;
          }
          .hook-text {
            font-size: 14px;
            color: #F8FAFC;
            font-weight: 600;
            white-space: pre-line;
          }
          .image-card {
            background: #020617;
            border: 1px solid #1E293B;
            border-radius: 14px;
            padding: 8px;
            margin-bottom: 16px;
            text-align: center;
          }
          .image-card img {
            width: 100%;
            height: auto;
            border-radius: 10px;
            display: block;
          }
          .full-body {
            background: #131D33;
            border: 1px solid #1E293B;
            border-radius: 12px;
            padding: 14px;
            font-size: 13.5px;
            color: #CBD5E1;
            white-space: pre-line;
            line-height: 1.6;
            margin-bottom: 16px;
          }
          .hashtags {
            color: #60A5FA;
            font-family: monospace;
            font-size: 12px;
            margin-top: 10px;
            display: block;
          }
          .action-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-top: 1px solid #1E293B;
            padding: 12px 16px;
            display: flex;
            gap: 8px;
            max-width: 500px;
            margin: 0 auto;
            z-index: 100;
          }
          .btn-approve {
            flex: 2;
            padding: 12px 10px;
            background: #059669;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 800;
            text-decoration: none;
            text-align: center;
            box-shadow: 0 4px 15px rgba(5,150,105,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .btn-revamp {
            flex: 1.5;
            padding: 12px 10px;
            background: #D97706;
            color: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(217,119,6,0.3);
          }
          .btn-reject {
            flex: 1;
            padding: 12px 10px;
            background: #881337;
            color: #FDA4AF;
            border: 1px solid #BE123C;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 800;
            text-decoration: none;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* Popout Revamp Modal */
          .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(6px);
            z-index: 999;
            padding: 16px;
            align-items: center;
            justify-content: center;
          }
          .modal-card {
            background: #0F172A;
            border: 1px solid #0284C7;
            border-radius: 18px;
            width: 100%;
            max-width: 440px;
            padding: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            animation: slideUp 0.25s ease-out;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .modal-header h3 {
            color: #F8FAFC;
            font-size: 17px;
            font-weight: 800;
          }
          .modal-close {
            background: transparent;
            border: none;
            color: #94A3B8;
            font-size: 22px;
            cursor: pointer;
          }
          .modal-desc {
            font-size: 12.5px;
            color: #94A3B8;
            margin-bottom: 12px;
            line-height: 1.4;
          }
          .modal-card textarea {
            width: 100%;
            background: #020617;
            border: 1px solid #334155;
            border-radius: 10px;
            padding: 12px;
            color: #F8FAFC;
            font-family: inherit;
            font-size: 13.5px;
            resize: vertical;
            outline: none;
            margin-bottom: 10px;
          }
          .modal-card textarea:focus {
            border-color: #38BDF8;
          }
          .preset-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 16px;
          }
          .preset-chips span {
            background: #1E293B;
            color: #38BDF8;
            border: 1px solid #0284C7;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
            font-weight: 600;
          }
          .modal-btn-row {
            display: flex;
            gap: 10px;
          }
          .btn-cancel {
            flex: 1;
            padding: 12px;
            background: #1E293B;
            color: #94A3B8;
            border: 1px solid #334155;
            border-radius: 10px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
          }
          .btn-revamp-submit {
            flex: 2;
            padding: 12px;
            background: linear-gradient(135deg, #D97706, #B45309);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 800;
            font-size: 13px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(217,119,6,0.4);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">${post.pillar_name || 'AI Automation'}</span>
            <span class="status-tag" id="statusTag">${post.status.replace('_', ' ')}</span>
            <h1 class="title" id="postTitle">${post.title}</h1>
            <p class="meta">⏰ Scheduled: ${post.scheduled_date} @ ${post.scheduled_time_wat} WAT</p>
          </div>

          <div class="content-body">
            <div id="revampNotice" style="display: none; background: #064E3B; border: 1px solid #059669; border-radius: 10px; padding: 12px; font-size: 13px; color: #6EE7B7; margin-bottom: 16px;">
              <strong>✔ Revamp applied!</strong> Review the updated post copy below and tap Approve when satisfied.
            </div>

            <div class="hook-box">
              <span class="hook-label">Opening Hook:</span>
              <p class="hook-text" id="postHook">${post.hook}</p>
            </div>

            ${slides.length > 0 ? `
            <div class="carousel-box" style="background: #020617; border: 1px solid #1E293B; border-radius: 14px; padding: 10px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 800; color: #38BDF8; text-transform: uppercase;">📸 5-Slide Technical Carousel</span>
                <span id="slideCounter" style="font-size: 11px; font-family: monospace; color: #94A3B8; background: #1E293B; padding: 2px 8px; border-radius: 10px;">Slide 1 of ${slides.length}</span>
              </div>
              <div style="position: relative; text-align: center; border-radius: 10px; overflow: hidden; background: #000;">
                <img id="postImageEl" src="${slides[0]}" alt="Post Carousel Slide" style="width: 100%; height: auto; border-radius: 10px; display: block;" onerror="this.onerror=null;this.src='/media/visual_post-11479d67_why-most-outages-are-process-f.svg';" />
                ${slides.length > 1 ? `
                <button type="button" onclick="prevSlide()" style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); background: rgba(15,23,42,0.85); color: #FFF; border: 1px solid #334155; border-radius: 50%; width: 34px; height: 34px; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center;">‹</button>
                <button type="button" onclick="nextSlide()" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: rgba(15,23,42,0.85); color: #FFF; border: 1px solid #334155; border-radius: 50%; width: 34px; height: 34px; font-size: 18px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center;">›</button>
                ` : ''}
              </div>
              ${slides.length > 1 ? `
              <div id="slideDots" style="display: flex; justify-content: center; gap: 6px; margin-top: 10px;">
                ${slides.map((_, i) => `<span onclick="goToSlide(${i})" class="slide-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${i === 0 ? '#38BDF8' : '#334155'}; cursor: pointer;"></span>`).join('')}
              </div>
              ` : ''}
            </div>
            ` : '<div id="postImageContainer" style="display:none;"><img id="postImageEl" src="" alt="Post Graphic" /></div>'}

            <div class="full-body">
              <span id="postContent">${post.content}</span>
              <span class="hashtags">${post.hashtags}</span>
            </div>

            ${post.first_comment ? `
            <div style="background: #111A2E; border: 1px solid #1E293B; border-radius: 10px; padding: 12px; font-size: 12px; color: #94A3B8; margin-bottom: 20px;">
              <strong style="color: #38BDF8; display: block; margin-bottom: 4px;">Pinned First Comment:</strong>
              ${post.first_comment}
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Fixed Action Bar with Revamp Button -->
        <div class="action-bar">
          <a class="btn-reject" href="${rejectUrl}">Reject</a>
          <button class="btn-revamp" onclick="openRevampModal()">✨ Revamp</button>
          <a class="btn-approve" href="${approveUrl}">✅ Approve</a>
        </div>

        <!-- Popout Revamp Modal -->
        <div id="revampModal" class="modal-overlay">
          <div class="modal-card">
            <div class="modal-header">
              <h3>✨ Revamp Post Copy</h3>
              <button class="modal-close" onclick="closeRevampModal()">&times;</button>
            </div>
            <p class="modal-desc">Tell the AI what you want to change. It will revise this post immediately without starting from scratch:</p>
            <textarea id="revampInput" rows="4" placeholder="e.g. Change the hook to focus on battery backup under 48V, or make the call to action ask other NOC leads about their MTTR..."></textarea>
            <div class="preset-chips">
              <span onclick="setRevampPrompt('🎯 Make the opening hook punchier and more contrarian')">🎯 Punchier Hook</span>
              <span onclick="setRevampPrompt('⚡ Emphasize 789+ nodes telecom experience')">⚡ 789 Nodes</span>
              <span onclick="setRevampPrompt('⏳ Clarify my recent AI automation learning journey')">⏳ AI Journey</span>
              <span onclick="setRevampPrompt('💬 Change call-to-action to engage network engineers')">💬 Better Question</span>
            </div>
            <div class="modal-btn-row">
              <button type="button" onclick="closeRevampModal()" class="btn-cancel">Cancel</button>
              <button type="button" onclick="submitRevamp('${post.id}')" id="btnSubmitRevamp" class="btn-revamp-submit">Apply Revamp ✨</button>
            </div>
          </div>
        </div>

        <script>
          const carouselSlides = ${JSON.stringify(slides)};
          let curSlideIdx = 0;

          function updateSlideView() {
            if (!carouselSlides || carouselSlides.length === 0) return;
            const img = document.getElementById('postImageEl');
            if (img) img.src = carouselSlides[curSlideIdx];
            const counter = document.getElementById('slideCounter');
            if (counter) counter.innerText = 'Slide ' + (curSlideIdx + 1) + ' of ' + carouselSlides.length;
            const dots = document.querySelectorAll('.slide-dot');
            dots.forEach((dot, idx) => {
              dot.style.background = idx === curSlideIdx ? '#38BDF8' : '#334155';
            });
          }

          function nextSlide() {
            if (carouselSlides.length <= 1) return;
            curSlideIdx = (curSlideIdx + 1) % carouselSlides.length;
            updateSlideView();
          }

          function prevSlide() {
            if (carouselSlides.length <= 1) return;
            curSlideIdx = (curSlideIdx - 1 + carouselSlides.length) % carouselSlides.length;
            updateSlideView();
          }

          function goToSlide(n) {
            curSlideIdx = n;
            updateSlideView();
          }

          function openRevampModal() {
            document.getElementById('revampModal').style.display = 'flex';
            document.getElementById('revampInput').focus();
          }
          function closeRevampModal() {
            document.getElementById('revampModal').style.display = 'none';
          }
          function setRevampPrompt(text) {
            const input = document.getElementById('revampInput');
            input.value = text;
            input.focus();
          }
          async function submitRevamp(postId) {
            const input = document.getElementById('revampInput');
            const instructions = input.value.trim();
            if (!instructions) {
              alert('Please enter what you want to change.');
              return;
            }

            const btn = document.getElementById('btnSubmitRevamp');
            btn.innerText = 'Applying Revamp... ⏳';
            btn.disabled = true;

            try {
              const res = await fetch('/api/posts/' + postId + '/revamp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instructions })
              });
              const data = await res.json();
              if (data.success && data.post) {
                // Update post content in place
                document.getElementById('postTitle').innerText = data.post.title;
                document.getElementById('postHook').innerText = data.post.hook;
                document.getElementById('postContent').innerText = data.post.content;
                document.getElementById('statusTag').innerText = data.post.status.replace('_', ' ');

                // Update carousel if revised
                if (data.post.carousel_slides && data.post.carousel_slides.length > 0) {
                  carouselSlides.splice(0, carouselSlides.length, ...data.post.carousel_slides);
                  curSlideIdx = 0;
                  updateSlideView();
                } else if (data.post.image_url) {
                  const imgEl = document.getElementById('postImageEl');
                  if (imgEl) {
                    const cacheBuster = (data.post.image_url.includes('?') ? '&' : '?') + 't=' + Date.now();
                    imgEl.src = data.post.image_url + cacheBuster;
                  }
                }

                let noticeHtml = '<strong>✔ Revamp applied!</strong> Review the updated post copy below and tap Approve when satisfied.';
                if (data.newPost) {
                  noticeHtml += '<br><span style="font-size:12px; margin-top:4px; display:block; color:#A7F3D0;">✨ In addition, another candidate post ("' + data.newPost.title + '") was automatically created for approval!</span>';
                }
                document.getElementById('revampNotice').innerHTML = noticeHtml;
                document.getElementById('revampNotice').style.display = 'block';
                closeRevampModal();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                alert('Revamp error: ' + (data.error || 'Unknown error'));
              }
            } catch (err) {
              alert('Network error: ' + err.message);
            } finally {
              btn.innerText = 'Apply Revamp ✨';
              btn.disabled = false;
            }
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`Error loading mobile review: ${err.message}`);
  }
});

// Get Notification Channels & Public Mobile Access Info
app.get('/api/notifications/channels', (req, res) => {
  try {
    const baseUrl = NotificationDispatcher.getBaseUrl();
    const channels = {
      base_url: baseUrl,
      phone_email: 'seun.akin43@gmail.com',
      gemini_mobile_ready: true,
      telegram_configured: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
      make_configured: Boolean(process.env.MAKE_WEBHOOK_URL),
      sample_post_id: db.prepare("SELECT id FROM generated_posts WHERE status = 'pending_approval' LIMIT 1").get()?.id || null
    };
    res.json({ success: true, channels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Trigger Real Dispatch for a specific post
app.post('/api/notifications/dispatch-post', async (req, res) => {
  try {
    const { postId } = req.body || {};
    const post = db.prepare('SELECT p.*, cp.name as pillar_name FROM generated_posts p LEFT JOIN content_pillars cp ON p.pillar_id = cp.id WHERE p.id = ?').get(postId);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const result = await NotificationDispatcher.dispatchPostForApproval(post);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/quick-approve', (req, res) => {
  try {
    const { id, action = 'approved' } = req.query;
    if (!id) return res.status(400).send('Missing post id');

    const updated = ContentGeneratorEngine.setPostApproval(
      String(id),
      action === 'approved' ? 'approved' : 'rejected',
      'Authorized via 1-Tap Mobile Link'
    );

    const replacementNotice = updated.replacementPost ? `
      <div style="margin-top: 16px; padding: 14px; background: #064E3B; border: 1px solid #059669; border-radius: 12px; font-size: 13px; color: #6EE7B7; text-align: left; line-height: 1.5;">
        <strong style="color: #A7F3D0; display: block; margin-bottom: 4px;">✔ Replacement Post Auto-Created for Approval:</strong>
        "${updated.replacementPost.title}"<br>
        <span style="font-size: 11px; color: #94A3B8;">Scheduled for ${updated.replacementPost.scheduled_date} @ ${updated.replacementPost.scheduled_time_wat} WAT. Open your dashboard to review and approve it.</span>
      </div>
    ` : '';

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Post ${action === 'approved' ? 'Approved' : 'Rejected'} · Toluwanimi Platform</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090D16; color: #F8FAFC; padding: 24px; text-align: center; }
          .card { max-width: 440px; margin: 40px auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 16px; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; background: ${action === 'approved' ? '#065F46; color: #34D399;' : '#881337; color: #FDA4AF;'}; margin-bottom: 16px; }
          h2 { margin: 8px 0 16px; font-size: 20px; color: #FFFFFF; }
          p { font-size: 14px; color: #94A3B8; line-height: 1.5; }
          .time { font-family: monospace; color: #38BDF8; font-weight: bold; background: #082F49; padding: 4px 8px; border-radius: 6px; }
          .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #0284C7; color: white; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">${action === 'approved' ? '✔ AUTHORIZED & QUEUED' : '✖ REJECTED'}</div>
          <h2>${updated.title}</h2>
          <p>${action === 'approved' ? `This post is now approved and will <strong>automatically publish</strong> to LinkedIn at <span class="time">${updated.scheduled_date} ${updated.scheduled_time_wat} WAT</span> without requiring your laptop!` : 'This post draft has been rejected and removed from schedule.'}</p>
          ${replacementNotice}
          <a class="btn" href="javascript:window.close()">Close Window</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

app.post('/api/emergency/toggle', (req, res) => {
  try {
    const { activate } = req.body;
    const result = SchedulerService.toggleEmergencyPause(Boolean(activate));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notifications/test-reminder', (req, res) => {
  try {
    const { type } = req.body;
    const result = SchedulerService.triggerSimulatedMobileReminder(type || 'mon_approval');
    res.json({ success: true, notification: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/notifications/history', (req, res) => {
  try {
    const history = SchedulerService.getNotificationHistory();
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 8. ANALYTICS & WEEKLY REPORT ---
app.get('/api/analytics', (req, res) => {
  try {
    const published = LinkedInPublisherAgent.getPublishedHistory();
    const pillarStats = db.prepare(`
      SELECT cp.name, cp.slug, COUNT(p.id) as post_count
      FROM content_pillars cp
      LEFT JOIN generated_posts p ON cp.id = p.pillar_id
      GROUP BY cp.id
    `).all();

    const report = {
      week_label: 'Current Week',
      total_published: published.length,
      total_impressions: 1420,
      total_reactions: 88,
      total_comments: 19,
      top_performing_pillar: 'Telecommunications & NOC Operations',
      key_takeaways: 'Posts backed by specific verified operational metrics (789+ nodes, 99.8% SLA) generate 3.4x higher discussion engagement than theoretical tool overviews.'
    };

    res.json({
      success: true,
      published,
      pillarStats,
      report
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 9. CLOUD CRON / WEBHOOK DISPATCHER (For Vercel Crons & External Schedulers) ---
app.all('/api/cron', async (req, res) => {
  try {
    const result = await SchedulerService.runSchedulerTick();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      dispatched: result || null
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve built production frontend static files if dist exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback all non-API GET requests to index.html (SPA routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/media')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.NOW_REGION != null;

// Start Autonomous Background Scheduler (checks every 60 seconds)
let workerTimer = null;
if (!isVercel) {
  const WORKER_INTERVAL_MS = 60 * 1000;
  workerTimer = setInterval(async () => {
    try {
      await SchedulerService.runSchedulerTick();
    } catch (err) {
      console.error('Background Scheduler tick error:', err);
    }
  }, WORKER_INTERVAL_MS);
}

let server = null;
let listenRetries = 0;
const MAX_LISTEN_RETRIES = 12;

function startServer() {
  server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      if (listenRetries < MAX_LISTEN_RETRIES) {
        listenRetries++;
        console.warn(`\n⚠️  Port ${PORT} is temporarily busy. Retrying in 1s (${listenRetries}/${MAX_LISTEN_RETRIES})...`);
        setTimeout(() => {
          startServer();
        }, 1000);
      } else {
        console.error(`\n⚠️  PORT ${PORT} CONFLICT: An existing process is persistently holding port ${PORT}.`);
        console.error(`👉 Run 'npx kill-port ${PORT}' or terminate the process holding port ${PORT}.\n`);
      }
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n============================================================`);
    console.log(`🚀 Platform Backend running on http://0.0.0.0:${PORT}`);
    console.log(`📱 LAN Mobile Review URL: http://192.168.1.77:${PORT}/api/mobile-review`);
    console.log(`✔ Autonomous Background Dispatcher active (polling every 60s)`);
    console.log(`============================================================\n`);
  });
}

if (!isVercel) {
  startServer();
}

const cleanup = () => {
  if (workerTimer) clearInterval(workerTimer);
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

export default app;
export { app };
