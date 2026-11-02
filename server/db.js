import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'platform.db');
export const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  db.exec(`
    -- 1. PROFILES
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      preferred_name TEXT NOT NULL,
      role TEXT NOT NULL,
      headline TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      location TEXT,
      linkedin_urn TEXT,
      vanity_name TEXT,
      timezone TEXT DEFAULT 'Africa/Lagos',
      emergency_pause_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 2. BRAND MEMORY
    CREATE TABLE IF NOT EXISTS brand_memory (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL, -- 'tone', 'rule', 'fact', 'metric', 'forbidden', 'core_belief'
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 3. PROJECTS
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'real', 'prototype', 'simulated', 'experiment'
      category TEXT NOT NULL, -- 'telecom', 'ai_automation', 'data_analytics', 'cloud_security'
      problem_statement TEXT NOT NULL,
      business_use_case TEXT NOT NULL,
      solution_design TEXT NOT NULL,
      tech_stack TEXT NOT NULL, -- JSON array
      architecture_summary TEXT NOT NULL,
      status TEXT NOT NULL, -- 'Idea', 'Researching', 'Designed', 'In Development', 'Prototype Complete', 'Testing', 'Demonstration Ready', 'Published', 'Archived'
      live_url TEXT,
      repo_url TEXT,
      is_simulated INTEGER DEFAULT 0,
      synthetic_data_summary TEXT,
      lessons_learned TEXT,
      code_snippets TEXT, -- JSON structure of runnable code
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 4. PROJECT TASKS
    CREATE TABLE IF NOT EXISTS project_tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      task_type TEXT NOT NULL, -- 'architecture', 'frontend', 'backend', 'workflow', 'synthetic_data', 'testing', 'documentation'
      status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 5. PROJECT EVIDENCE
    CREATE TABLE IF NOT EXISTS project_evidence (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      evidence_type TEXT NOT NULL, -- 'screenshot', 'architecture_diagram', 'workflow_schema', 'synthetic_dataset', 'benchmark_metric'
      file_path TEXT,
      data_payload TEXT,
      is_verified INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- 6. CONTENT PILLARS
    CREATE TABLE IF NOT EXISTS content_pillars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      weekly_target_posts INTEGER DEFAULT 1,
      priority_weight INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 7. CONTENT IDEAS
    CREATE TABLE IF NOT EXISTS content_ideas (
      id TEXT PRIMARY KEY,
      pillar_id TEXT NOT NULL,
      title TEXT NOT NULL,
      angle TEXT NOT NULL,
      problem_context TEXT,
      source_reference_id TEXT,
      status TEXT DEFAULT 'unexplored', -- 'unexplored', 'drafted', 'published', 'discarded'
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pillar_id) REFERENCES content_pillars(id)
    );

    -- 8. GENERATED POSTS
    CREATE TABLE IF NOT EXISTS generated_posts (
      id TEXT PRIMARY KEY,
      pillar_id TEXT NOT NULL,
      project_id TEXT,
      idea_id TEXT,
      title TEXT NOT NULL,
      hook TEXT NOT NULL,
      content TEXT NOT NULL,
      hashtags TEXT NOT NULL, -- comma or JSON string
      audience_question TEXT,
      first_comment TEXT,
      intended_audience TEXT,
      content_format TEXT NOT NULL, -- 'Educational', 'Technical Tutorial', 'Project Demo', 'Lessons Learned', 'Architecture', 'Case Study'
      source_links TEXT, -- JSON array
      status TEXT DEFAULT 'pending_approval', -- 'pending_approval', 'approved', 'rejected', 'revision_requested', 'scheduled', 'published', 'failed'
      scheduled_date TEXT NOT NULL, -- YYYY-MM-DD
      scheduled_time_wat TEXT NOT NULL, -- HH:MM
      quality_score INTEGER DEFAULT 95,
      duplicate_similarity_score REAL DEFAULT 0.0,
      image_prompt TEXT,
      image_url TEXT,
      media_asset_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (pillar_id) REFERENCES content_pillars(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );

    -- 9. CONTENT VERSIONS
    CREATE TABLE IF NOT EXISTS content_versions (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      version_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      hook TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES generated_posts(id) ON DELETE CASCADE
    );

    -- 10. MEDIA ASSETS
    CREATE TABLE IF NOT EXISTS media_assets (
      id TEXT PRIMARY KEY,
      post_id TEXT,
      project_id TEXT,
      asset_type TEXT NOT NULL, -- 'illustration', 'infographic', 'diagram', 'screenshot', 'carousel_slide'
      file_path TEXT NOT NULL,
      prompt TEXT,
      dimensions TEXT DEFAULT '1080x1080',
      aspect_ratio TEXT DEFAULT '1:1',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 11. CONTENT APPROVALS
    CREATE TABLE IF NOT EXISTS content_approvals (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      decision TEXT NOT NULL, -- 'approved', 'rejected', 'revision_requested', 'rescheduled'
      feedback TEXT,
      reviewer_name TEXT NOT NULL,
      decision_timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES generated_posts(id) ON DELETE CASCADE
    );

    -- 12. PUBLISHING SCHEDULE
    CREATE TABLE IF NOT EXISTS publishing_schedule (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL UNIQUE,
      scheduled_for_wat TEXT NOT NULL, -- ISO or YYYY-MM-DD HH:MM
      status TEXT DEFAULT 'queued', -- 'queued', 'in_progress', 'published', 'paused', 'failed'
      retry_count INTEGER DEFAULT 0,
      last_error TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES generated_posts(id) ON DELETE CASCADE
    );

    -- 13. PUBLISHED POSTS
    CREATE TABLE IF NOT EXISTS published_posts (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      linkedin_share_urn TEXT NOT NULL,
      permalink TEXT,
      published_at_wat TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'live',
      response_payload TEXT,
      FOREIGN KEY (post_id) REFERENCES generated_posts(id) ON DELETE CASCADE
    );

    -- 14. ENGAGEMENT METRICS
    CREATE TABLE IF NOT EXISTS engagement_metrics (
      id TEXT PRIMARY KEY,
      published_post_id TEXT NOT NULL,
      impressions INTEGER DEFAULT 0,
      reactions INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      reposts INTEGER DEFAULT 0,
      engagement_rate REAL DEFAULT 0.0,
      snapshot_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (published_post_id) REFERENCES published_posts(id) ON DELETE CASCADE
    );

    -- 15. NOTIFICATION LOGS
    CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      schedule_type TEXT NOT NULL, -- 'sun_prep', 'mon_approval', 'wed_midweek', 'fri_review', 'custom', 'emergency'
      recipient TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'sent', -- 'sent', 'pending', 'failed'
      sent_at_wat TEXT DEFAULT (datetime('now'))
    );

    -- 16. RESEARCH SOURCES
    CREATE TABLE IF NOT EXISTS research_sources (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      publisher TEXT NOT NULL,
      publication_date TEXT NOT NULL,
      factual_claims TEXT NOT NULL,
      verification_grade TEXT DEFAULT 'verified', -- 'verified', 'opinion', 'unverified'
      fact_checker_notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 17. COMMENT DRAFTS
    CREATE TABLE IF NOT EXISTS comment_drafts (
      id TEXT PRIMARY KEY,
      published_post_id TEXT NOT NULL,
      commenter_name TEXT NOT NULL,
      commenter_urn TEXT,
      comment_text TEXT NOT NULL,
      suggested_reply TEXT NOT NULL,
      reply_style TEXT DEFAULT 'professional', -- 'professional', 'friendly', 'technical', 'thought_provoking'
      status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'discarded'
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (published_post_id) REFERENCES published_posts(id) ON DELETE CASCADE
    );

    -- 18. PROFESSIONAL LEADS
    CREATE TABLE IF NOT EXISTS professional_leads (
      id TEXT PRIMARY KEY,
      contact_name TEXT NOT NULL,
      profile_url TEXT,
      company TEXT,
      role TEXT,
      opportunity_type TEXT NOT NULL, -- 'job', 'consulting', 'collaboration', 'speaking', 'networking'
      notes TEXT,
      status TEXT DEFAULT 'new', -- 'new', 'in_discussion', 'converted', 'archived'
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 19. AUTOMATION LOGS
    CREATE TABLE IF NOT EXISTS automation_logs (
      id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'success', -- 'success', 'warning', 'error'
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 20. CONTENT PERFORMANCE REPORTS
    CREATE TABLE IF NOT EXISTS content_performance_reports (
      id TEXT PRIMARY KEY,
      week_label TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      total_generated INTEGER DEFAULT 0,
      total_approved INTEGER DEFAULT 0,
      total_published INTEGER DEFAULT 0,
      total_impressions INTEGER DEFAULT 0,
      total_reactions INTEGER DEFAULT 0,
      total_comments INTEGER DEFAULT 0,
      best_pillar TEXT,
      best_post_id TEXT,
      key_takeaways TEXT,
      recommendations TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safe incremental migration
  try {
    db.exec("ALTER TABLE generated_posts ADD COLUMN image_url TEXT");
  } catch (e) {
    // Column already exists
  }

  try {
    db.exec("ALTER TABLE generated_posts ADD COLUMN carousel_slides TEXT");
  } catch (e) {
    // Column already exists
  }

  seedInitialData();
}

function seedInitialData() {
  // Check if profile exists
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get();
  if (profileCount.count === 0) {
    db.prepare(`
      INSERT INTO profiles (id, name, preferred_name, role, headline, email, phone, location, linkedin_urn, vanity_name, timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'profile-toluwanimi',
      'Toluwanimi Taiwo Akinyemi',
      'Toluwanimi Akinyemi',
      'Telecommunications Network Operations Engineer & AI Automation Engineer',
      'scaling cloud, data & AI systems for enterprises',
      'seun.akin43@gmail.com',
      '+234 813 589 8224',
      'Nigeria (Available Remote & Hybrid Worldwide)',
      'urn:li:person:-XwFu54idT',
      'akinyemi-toluwanimi',
      'Africa/Lagos'
    );
  }

  // Check content pillars
  const pillarCount = db.prepare('SELECT COUNT(*) as count FROM content_pillars').get();
  if (pillarCount.count === 0) {
    const pillars = [
      { id: 'pillar-1', name: 'AI Automation', slug: 'ai-automation', desc: 'AI agents, intelligent workflows, Make.com/n8n, API & database integrations, practical business automation.', weight: 1, target: 1 },
      { id: 'pillar-2', name: 'Telecommunications & NOC Operations', slug: 'telecom-noc', desc: 'Network operations, incident management, root-cause analysis, 99.8% SLA uptime, automated alarm validation.', weight: 1, target: 1 },
      { id: 'pillar-3', name: 'Projects & Technical Demonstrations', slug: 'projects-demos', desc: 'ExpenseIQ architecture, NOC automation assistants, Supabase integrations, working prototypes, before/after comparisons.', weight: 1, target: 1 },
      { id: 'pillar-4', name: 'Professional Development', slug: 'professional-dev', desc: 'AI Automation learning journey, skills development, challenges, breakthroughs, career reflections.', weight: 1, target: 1 },
      { id: 'pillar-5', name: 'Industry Insights', slug: 'industry-insights', desc: 'AI developments, cloud computing, data analytics trends, future of work, telecommunications innovation.', weight: 1, target: 1 },
      { id: 'pillar-6', name: 'Engagement & Thought Leadership', slug: 'thought-leadership', desc: 'Operational debate questions, reasoned professional opinions, practical tips for tech engineers, business automation adoption.', weight: 1, target: 1 }
    ];

    const insertPillar = db.prepare(`
      INSERT INTO content_pillars (id, name, slug, description, weekly_target_posts, priority_weight)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const p of pillars) {
      insertPillar.run(p.id, p.name, p.slug, p.desc, p.target, p.weight);
    }
  }

  // Check initial projects
  const projCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projCount.count === 0) {
    const insertProj = db.prepare(`
      INSERT INTO projects (id, title, type, category, problem_statement, business_use_case, solution_design, tech_stack, architecture_summary, status, live_url, repo_url, is_simulated, synthetic_data_summary, lessons_learned, code_snippets)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProj.run(
      'proj-expenseiq',
      'ExpenseIQ - AI Enterprise Expense Platform',
      'real',
      'ai_automation',
      'Manual expense processing, receipt reconciliation, and policy auditing drain hundreds of finance team hours monthly and suffer high human error rates.',
      'Automates receipt scanning, expense categorization, policy checks, approval routing, and reimbursement reporting for finance departments.',
      'Lovable + Supabase application with AI-driven categorization agents, role-based approval hierarchies, and automated audit trails.',
      JSON.stringify(['Lovable', 'Supabase', 'Gemini API', 'Make.com', 'REST APIs']),
      'Client UI submits receipts -> Edge function invokes multimodal AI parser -> Supabase stores transaction -> Automated approval webhook dispatches to manager.',
      'Demonstration Ready',
      'https://expense-ai-pro-14.lovable.app/login',
      'https://github.com/seunakin43/akinyemi-portfolio',
      0,
      '50 simulated enterprise expense receipts across travel, software, hardware, and client entertainment.',
      'Multimodal LLMs excel at structured JSON receipt extraction when provided with rigorous JSON-schema guardrails.',
      JSON.stringify({
        main: '// ExpenseIQ Categorization Engine\nexport async function categorizeExpense(receipt) {\n  return aiAgent.parseReceipt(receipt, { schema: ExpenseSchema });\n}'
      })
    );

    insertProj.run(
      'proj-noc-pan-african',
      'Pan African Towers 789+ Nodes NOC Surveillance',
      'real',
      'telecom',
      'Monitoring 789+ distributed cellular transmission towers across Nigeria with high variance in power reliability and fiber transmission.',
      'Ensuring 99.8% nationwide SLA uptime, cutting MTTR across regional clusters, and preventing cascaded cellular outages.',
      '24/7 telemetry surveillance on OWS and Galooli RMS dashboards coupled with standardized Root Cause Analysis templates.',
      JSON.stringify(['OWS Monitoring', 'Galooli RMS', 'Power BI', 'SQL', 'Root Cause Analysis']),
      'IoT RMS sensors stream cell tower voltage, temperature, and fuel levels -> OWS triggers predictive alerts -> Operator dispatches field engineers with RCA templates.',
      'Demonstration Ready',
      'https://www.toluwanimi-main-portfolio.vercel.app',
      'https://github.com/seunakin43/akinyemi-portfolio',
      0,
      'Telemetry logs across 789 nodes tracking power fluctuations, battery health, and generator cutovers.',
      'Standardizing RCA templates reduced MTTR by 30% and shifted the operations team from reactive firefighting to predictive maintenance.',
      JSON.stringify({
        rca: '// Standardized RCA Protocol\nconst RCA_CHECKLIST = ["Site ID", "Battery Voltage (VDC)", "Fuel Level (%)", "Grid Availability", "Alarm Duration"];'
      })
    );

    insertProj.run(
      'proj-noc-incident-assistant',
      'NOC Incident Assistant Automation',
      'prototype',
      'ai_automation',
      'NOC operators manually cross-reference site IDs with regional engineer contact lists when sites go down, introducing 15-30 minutes of escalation delay.',
      'Autonomous webhook catches site-down alerts, matches site coordinates with on-duty field teams, and dispatches automated SMS/email escalations instantly.',
      'n8n / Make.com workflow backed by Supabase site registry and Gemini incident summarization.',
      JSON.stringify(['n8n', 'Make.com', 'Supabase', 'Gemini API', 'Twilio REST API']),
      'Alarm Webhook -> Site Registry Lookup -> Responsible Engineer Identification -> Escalation Dispatch -> Status Tracking in Supabase.',
      'Prototype Complete',
      null,
      'https://github.com/seunakin43/akinyemi-portfolio',
      0,
      'Synthetic site directory of 120 Nigerian telecom sites mapped to 15 regional cluster engineers.',
      'Automated site-to-engineer mapping cuts notification latency from 22 minutes to under 45 seconds.',
      JSON.stringify({
        workflow: '// Incident Escalation Pipeline\nexport function routeIncident(siteId, alarmType) {\n  const engineer = db.lookupSiteEngineer(siteId);\n  return dispatchAlert(engineer, { siteId, alarmType, priority: "CRITICAL" });\n}'
      })
    );

    insertProj.run(
      'proj-noc-alarm-validation',
      'NOC Low-Voltage Alarm Validator',
      'prototype',
      'telecom',
      'Transient power dips under 48V generate false-positive alarm storms, distracting operators from actual battery depletion events.',
      'Automated time-series validation filters out momentary voltage sags and only flags true deep-discharge battery failures.',
      'Python/Node telemetry ingestion service comparing consecutive voltage reads over a 5-minute rolling window.',
      JSON.stringify(['Node.js', 'PostgreSQL', 'TimescaleDB', 'REST APIs', 'Power BI']),
      'Telemetry Poller -> 5-min Rolling Voltage Buffer -> Threshold Evaluator (<48V for >3 consecutive ticks) -> Genuine Alarm Promotion.',
      'Prototype Complete',
      null,
      'https://github.com/seunakin43/akinyemi-portfolio',
      0,
      '1,000 synthetic time-series voltage readings simulating grid brownouts vs real battery drainage.',
      'Filtering transient sags reduced false-alarm fatigue by 42% across regional monitoring shifts.',
      JSON.stringify({
        validator: 'function isValidLowVoltage(voltageBuffer) {\n  return voltageBuffer.filter(v => v < 48.0).length >= 3;\n}'
      })
    );
  }

  // Check brand memory
  const memoryCount = db.prepare('SELECT COUNT(*) as count FROM brand_memory').get();
  if (memoryCount.count === 0) {
    const memories = [
      { id: 'mem-1', category: 'tone', key: 'writing_voice', value: 'Authoritative, technical, conversational, plain-spoken, crisp. Never corporate or fluffy.', notes: 'Follows Effective B2B LinkedIn standards' },
      { id: 'mem-2', category: 'forbidden', key: 'forbidden_words', value: 'game-changer, thrilled to announce, excited to share, synergy, paradigm shift, delve, testament, beacon', notes: 'AI cliches to strictly avoid' },
      { id: 'mem-3', category: 'metric', key: 'telecom_nodes', value: '789+ live cellular network nodes monitored across Nigeria at Pan African Towers', notes: 'Verified experience metric' },
      { id: 'mem-4', category: 'metric', key: 'sla_uptime', value: '99.8% nationwide SLA compliance sustained', notes: 'Verified SLA' },
      { id: 'mem-5', category: 'metric', key: 'mttr_reduction', value: '30% reduction in Mean Time to Repair via standardized RCA templates', notes: 'Verified improvement' },
      { id: 'mem-6', category: 'fact', key: 'education', value: 'Postgraduate Diploma in Financial Mathematics (UNIOSUN), B.Sc. Mathematics (FUNAAB)', notes: 'Verified academic credentials' },
      { id: 'mem-7', category: 'fact', key: 'certifications', value: 'Diploma in AI Automation (Utiva, ACTD #34RVXFBKSU73N), Diploma in Cloud Computing (SDC Canada #2325689)', notes: 'Verified diplomas' },
      { id: 'mem-8', category: 'core_belief', key: 'philosophy', value: 'Uptime is never an accident. Clean data beats complex models. AI workflows must be deterministic with strict guardrails.', notes: 'Core operational philosophy' },
      { id: 'mem-9', category: 'fact', key: 'verified_tools', value: 'Make.com, n8n, Google Gemini, OpenRouter, Supabase, Lovable, Airtable, Google Sheets, REST APIs, AI agents, automation workflows (Excluding: React, Tailwind CSS)', notes: 'Verified professional stack per Toluwanimi' },
      { id: 'mem-10', category: 'timeline', key: 'ai_automation_tenure', value: 'Started AI automation a few months ago as an active learner & developing AI Generalist. Never claim "years" or "over a year" in AI. Ground multi-year experience strictly in Telecommunications Network Operations (789+ nodes, 99.8% SLA).', notes: 'Strict anti-hallucination rule for AI experience duration' },
      { id: 'mem-11', category: 'credentials', key: 'expenseiq_test_login', value: 'ExpenseIQ test credentials: username test@expenseiq.com / password test@1234 (URL: https://expense-ai-pro-14.lovable.app/login)', notes: 'Live sandbox login for demonstrations' }
    ];

    const insertMem = db.prepare(`
      INSERT INTO brand_memory (id, category, key, value, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const m of memories) {
      insertMem.run(m.id, m.category, m.key, m.value, m.notes, 1);
    }
  }

  // Check research sources
  const sourceCount = db.prepare('SELECT COUNT(*) as count FROM research_sources').get();
  if (sourceCount.count === 0) {
    const insertSource = db.prepare(`
      INSERT INTO research_sources (id, url, title, publisher, publication_date, factual_claims, verification_grade, fact_checker_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSource.run(
      'src-1',
      'https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx',
      'Global Telecommunication Infrastructure Reliability and Network Metrics',
      'International Telecommunication Union (ITU)',
      '2024-09-15',
      'Cellular tower downtime in developing markets averages 4.2% primarily due to auxiliary grid failures and battery backup exhaustion.',
      'verified',
      'Official ITU statistical report on infrastructure availability.'
    );

    insertSource.run(
      'src-2',
      'https://n8n.io/blog/enterprise-ai-automation-reliability/',
      'Architecting Deterministic AI Workflows for Mission-Critical Operations',
      'n8n Engineering',
      '2024-11-20',
      'Deterministic schema validation and error fallback branches reduce AI workflow failure rates from 18% to under 0.4% in production.',
      'verified',
      'Technical post with open-source reference implementations.'
    );
  }
}
