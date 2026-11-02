import { db } from '../db.js';
import { QualityControlGuard } from './qcGuard.js';
import { DynamicVisualGenerator } from './imageGenerator.js';
import { DynamicCarouselGenerator } from './carouselGenerator.js';
import crypto from 'node:crypto';

export class ContentGeneratorEngine {
  /**
   * Generates a complete 5-day weekly LinkedIn calendar (Monday through Friday)
   * mapped across the 6 content pillars, formatted for West Africa Time (WAT).
   */
  static generateWeeklyCalendar({ startDateStr } = {}) {
    // If no start date provided, use the coming Monday
    const baseDate = startDateStr ? new Date(startDateStr) : this.getNextMonday();

    const calendarTemplates = [
      {
        dayOffset: 0, // Monday
        timeWAT: '08:15',
        pillarSlug: 'telecom-noc',
        format: 'Lessons Learned',
        title: 'Why Most Outages Are Process Failures, Not Tech Failures',
        hook: `Monitoring 789 cellular towers taught me that 90% of critical network outages don't start with hardware.\nThey start with ignored operational drift.`,
        content: `Monitoring 789 cellular towers taught me that 90% of critical network outages don't start with hardware.
They start with ignored operational drift.

When a remote cell site drops offline during an overnight storm, every minute of delay isn't just an SLA penalty.
It is an emergency call dropping, an ambulance dispatch stalling, or a business transaction failing.

Early in my NOC surveillance shift, we were constantly fire-fighting.
Alarms were blaring, technicians were dispatched blind, and Mean Time to Repair (MTTR) dragged out.

Here is what changed everything:

1. Standardizing Root Cause Analysis (RCA).
Instead of treating each voltage drop in isolation, we designed systematic failure categorization.
That single protocol cut regional MTTR by 30%.

2. Automating Alarm Threshold Validation.
Transient voltage dips under 48V happen daily on auxiliary grids.
When you write simple validation logic to filter temporary sags from true battery exhaustion, alert fatigue drops by half.

3. Documenting the Failure Signature.
If an outage pattern isn't codified into an automated alert rule, someone on the next shift will spend 3 hours debugging it again.

Operational excellence isn't heroic late-night fixing.
It is building systems so robust that heroism is never required.

What is the biggest operational bottleneck your engineering team is actively trying to eliminate?`,
        hashtags: '#Telecommunications #NetworkOperations #DevOps #ReliabilityEngineering #SystemsArchitecture',
        question: 'What is the biggest operational bottleneck your engineering team is actively trying to eliminate?',
        firstComment: 'Curious to hear from other NOC and SRE leads: do you prioritize alert filtering at the ingestion layer or in your ticketing system?',
        audience: 'Network Engineers, Telecom Operators, SREs, Infrastructure Directors',
        sources: ['https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx'],
        objective: 'Position Toluwanimi as an authoritative operational reliability specialist with 789+ nodes telemetry proof.',
        projectRef: 'proj-noc-pan-african',
        visualDesc: 'High-contrast technical diagram showing the 3-step Root Cause Analysis triage pipeline.',
        imagePrompt: 'Create a clean, minimalist 1080x1080 technical infographic in dark slate navy (#0F172A) and cyan (#38BDF8) showing a 3-step Incident Triage & RCA pipeline.',
        imageUrl: '/media/post_1_rca_triad.jpg'
      },
      {
        dayOffset: 1, // Tuesday
        timeWAT: '08:30',
        pillarSlug: 'ai-automation',
        format: 'Technical Tutorial',
        title: 'Building Deterministic AI Agents: Guardrails First, Intelligence Second',
        hook: `An AI agent that works 95% of the time in a demo is a liability in production.\nIn real operations, that 5% failure rate breaks customer trust.`,
        content: `An AI agent that works 95% of the time in a demo is a liability in production.
In real operations, that 5% failure rate breaks customer trust.

Over the past few months of building autonomous workflows in n8n, Make.com, and the Gemini API—applying my operational discipline from telecom NOC engineering—I quickly discovered the hardest part of AI automation:
It is never the model's intelligence.
It is ensuring deterministic execution under messy real-world inputs.

Here is the 4-part architecture I use to keep AI agents reliable:

1. Strict Schema Enforcement (Structured JSON Schema).
Never ask an LLM for free-form responses when triggering backend state changes.
Constrain every output to strict JSON schemas with type validation before passing parameters to any database or API.

2. Fallback Circuit Breakers.
If an external API fails or a model returns an unexpected token, the workflow must not crash silently.
Route execution into a deterministic fallback branch that notifies on-call teams with an exact snapshot of the payload.

3. Human-in-the-Loop Approval Gates.
For irreversible actions—such as sending client invoices, dispatching field crews, or executing database mutations—keep a mandatory approval checkpoint.
The AI drafts and organizes; the human clicks Approve.

4. Comprehensive State Logging.
Log every prompt variation, latency metric, and parsing error into Supabase or PostgreSQL.
You cannot improve what you cannot audit.

Intelligence without guardrails is a liability.
Engineer the boundaries first, and the intelligence will do its job safely.

Are you running autonomous AI workflows in production, or keeping them strictly in sandbox stages?`,
        hashtags: '#AIEngineering #Automation #MakeCom #n8n #SoftwareArchitecture',
        question: 'Are you running autonomous AI workflows in production, or keeping them strictly in sandbox stages?',
        firstComment: 'I built this deterministic validation pattern into my ExpenseIQ platform and false categorization dropped to near zero. Happy to share the schema template if useful!',
        audience: 'AI Engineers, Full-Stack Developers, Automation Consultants, Tech Leads',
        sources: ['https://n8n.io/blog/enterprise-ai-automation-reliability/'],
        objective: 'Demonstrate deep practical competence in production-grade AI agent design and deterministic workflows.',
        projectRef: 'proj-expenseiq',
        visualDesc: 'Flowchart visual showing the 4-layer AI agent guardrail architecture.',
        imagePrompt: 'A futuristic holographic circuit diagram displaying an AI decision pipeline with green verified guardrail checkpoints and a blue central neural core.',
        imageUrl: '/media/post_2_ai_guardrails.jpg'
      },
      {
        dayOffset: 2, // Wednesday
        timeWAT: '08:15',
        pillarSlug: 'projects-demos',
        format: 'Project Demo',
        title: 'Inside ExpenseIQ: How We Automated Multi-Tenant Expense Auditing',
        hook: `Finance teams spend an average of 18 minutes reviewing every single expense receipt.\nWe built ExpenseIQ to reduce that to under 10 seconds.`,
        content: `Finance teams spend an average of 18 minutes reviewing every single expense receipt.
We built ExpenseIQ to reduce that to under 10 seconds.

When building ExpenseIQ (https://expense-ai-pro-14.lovable.app/login), my goal was to eliminate the friction between employee expense submissions and finance policy auditing.

Here is the system architecture behind the application:

• Frontend: Responsive Lovable application interface with role-based dashboard views for submitters and finance approvers.
• Multimodal Parser: Uses Gemini 1.5 Flash to extract vendor names, line items, taxes, currency codes, and payment methods from uploaded receipt images in milliseconds.
• Database & Auth: Supabase PostgreSQL managing row-level security (RLS) so multi-tenant organizations only see their authorized departmental records.
• Policy Engine: Automatically flags expenses that exceed per-diem limits or violate corporate travel policies before a manager even opens the notification.

The biggest technical breakthrough?
Handling blurry, crumpled, and multi-currency receipts.
By supplying few-shot formatting examples directly in the system prompt, our extraction accuracy jumped from 76% to 98.4%.

Automating manual toil doesn't just save time.
It allows finance teams to focus on strategic forecasting instead of deciphering faded thermal paper.

You can test out the sandbox live here:
https://expense-ai-pro-14.lovable.app/login

What internal administrative process at your company is crying out for an automated makeover?`,
        hashtags: '#AIAutomation #Supabase #NoCode #AIEngineering #Fintech',
        question: 'What internal administrative process at your company is crying out for an automated makeover?',
        firstComment: 'Demo sandbox credentials: username test@expenseiq.com / password test@1234. Feel free to submit test receipts and see the categorization engine in action!',
        audience: 'Finance Directors, CTOs, Operations Managers, Software Engineers',
        sources: ['https://www.toluwanimi-main-portfolio.vercel.app'],
        objective: 'Showcase ExpenseIQ as a working demonstration of full-stack engineering and AI integration.',
        projectRef: 'proj-expenseiq',
        visualDesc: 'Split-screen product screenshot showing receipt upload alongside extracted JSON policy validation.',
        imagePrompt: 'A sleek, modern dual-pane UI mockup of ExpenseIQ showing a digital receipt on the left and automated AI categorization metrics on the right.',
        imageUrl: '/media/post_3_expenseiq_mockup.jpg'
      },
      {
        dayOffset: 3, // Thursday
        timeWAT: '08:45',
        pillarSlug: 'industry-insights',
        format: 'Industry Commentary',
        title: 'Why Telecom Is Quietly Becoming the Proving Ground for Practical AI',
        hook: `While consumer tech argues about chat interfaces, telecommunications networks are silently proving where AI actually delivers ROI:\nAt the physical edge.`,
        content: `While consumer tech argues about chat interfaces, telecommunications networks are silently proving where AI actually delivers ROI:
At the physical edge.

Telecom infrastructure is unforgiving.
You are dealing with physical towers, battery banks, variable power grids, fiber backhauls, and millions of connected mobile subscribers demanding 99.9% uptime.

Here is why telecom is leading the next frontier of applied artificial intelligence:

1. High-Velocity Telemetry Streams.
Every cellular node generates millions of data points every hour—voltage, temperature, packet loss, RSSI, and traffic density.
Traditional human monitoring cannot scale to thousands of nodes simultaneously. Machine learning can.

2. Predictive Failure over Reactive Fixing.
An AI agent analyzing thermal and voltage trends can detect a degrading power rectifier 48 hours before it blows a fuse.
Catching it early prevents a cascade failure across an entire regional cluster.

3. Automated Root Cause Correlation.
When a fiber cut occurs, hundreds of downstream cell sites trigger alarms simultaneously.
AI correlation groups those 300 alerts into a single root-cause incident in seconds, saving dispatch teams hours of confusion.

The future of AI isn't just generating text or pictures.
It is keeping the physical infrastructure of the modern world running without interruption.

Do you see AI adoption moving faster in pure digital software, or in physical infrastructure operations?`,
        hashtags: '#Telecommunications #EdgeAI #PredictiveMaintenance #CloudInfrastructure #FutureOfWork',
        question: 'Do you see AI adoption moving faster in pure digital software, or in physical infrastructure operations?',
        firstComment: 'In emerging markets especially, solving power volatility with smart battery telemetry is one of the highest-leverage applications of automation today.',
        audience: 'Telecommunications Executives, Infrastructure Engineers, IoT Developers, Tech Investors',
        sources: ['https://spectrum.ieee.org/telecom-ai-automation'],
        objective: 'Bridge telecommunications domain depth with broader AI industry insights to build strategic thought leadership.',
        projectRef: 'proj-noc-pan-african',
        visualDesc: 'Abstract network topology map showing smart telecom towers communicating with an edge AI cloud node.',
        imagePrompt: 'A cinematic wide visual of glowing 5G cellular communication towers connected to an ethereal digital neural network at sunrise.',
        imageUrl: '/media/post_4_telecom_power.svg'
      },
      {
        dayOffset: 4, // Friday
        timeWAT: '08:30',
        pillarSlug: 'thought-leadership',
        format: 'Problem & Solution',
        title: 'The "AI Generalist" Mindset: Why Depth in One Domain Supercharges Automation',
        hook: `There is a common debate in tech:\nShould you be a hyper-specialized expert or a generalist?\nMy experience in telecommunications and AI taught me a third option.`,
        content: `There is a common debate in tech:
Should you be a hyper-specialized expert or a generalist?
My experience in telecommunications and AI taught me a third option.

The most valuable engineers today are "T-shaped AI Generalists."

They have deep, battle-tested operational domain experience in one field (like network reliability, finance, or logistics).
AND they have the broad technical agility to connect that domain with AI agents, cloud architecture, and modern automation tools.

Here is why this combination is so powerful:

1. You Know What Real Problems Look Like.
Anyone can watch a 10-minute tutorial on how to wire an n8n webhook.
Very few people know the pain of troubleshooting a 48V battery bank failure at 3:00 AM on a nationwide network.
Deep domain knowledge gives you genuine problems worth solving.

2. You Avoid "Toy Automations."
When you understand operational risk, you don't build brittle automations that crash when an edge case appears.
You design for failure states, rate limits, data governance, and deterministic recovery.

3. You Translate Technical Capabilities into Business Uptime.
Executives don't care what language model you invoked.
They care that SLA compliance stayed at 99.8% and MTTR dropped by 30%.

Technical tools will keep changing every 6 months.
The ability to analyze an operational breakdown, design an intelligent system, and deliver reliable performance is a timeless skill.

What combination of domain expertise and new tech are you actively developing right now?`,
        hashtags: '#CareerGrowth #AIGeneralist #ContinuousLearning #SystemsThinking #EngineeringLeadership',
        question: 'What combination of domain expertise and new tech are you actively developing right now?',
        firstComment: 'My journey started in pure mathematics, moved through financial statistics, scaled across telecom operations, and is now deepening in AI systems. Every layer builds on the previous one.',
        audience: 'Software Engineers, Early-Career Professionals, Hiring Managers, Tech Founders',
        sources: ['https://www.toluwanimi-main-portfolio.vercel.app'],
        objective: 'Articulate the "AI Generalist" positioning clearly and inspire meaningful engagement across career and technical networks.',
        projectRef: 'proj-expenseiq',
        visualDesc: 'Clean graphic illustrating the T-shaped engineer model combining operational depth with AI agility.',
        imagePrompt: 'A minimalist architectural infographic illustrating a T-shaped skill diagram with deep operational foundation and broad AI cloud wings.',
        imageUrl: '/media/post_5_ai_generalist.svg'
      }
    ];

    const generatedPosts = [];

    for (const item of calendarTemplates) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(targetDate.getDate() + item.dayOffset);
      const scheduledDateStr = targetDate.toISOString().split('T')[0];

      // Prevent duplicate generation for same day and title
      const existing = db.prepare('SELECT * FROM generated_posts WHERE scheduled_date = ? AND title = ?').get(scheduledDateStr, item.title);
      if (existing) {
        generatedPosts.push(existing);
        continue;
      }

      const pillar = db.prepare('SELECT id, name FROM content_pillars WHERE slug = ?').get(item.pillarSlug);
      const pillarId = pillar ? pillar.id : 'pillar-1';
      const pillarName = pillar ? pillar.name : 'AI Automation';

      const postId = `post-${crypto.randomUUID().slice(0, 8)}`;

      // Generate a distinct 5-slide technical carousel for this post
      const carouselSlides = DynamicCarouselGenerator.generateCarousel({
        postId,
        title: item.title,
        hook: item.hook,
        content: item.content,
        pillarSlug: item.pillarSlug,
        pillarName,
        contentFormat: item.format,
        hashtags: item.hashtags,
        audienceQuestion: item.question
      });
      const distinctImageUrl = carouselSlides[0] || `/media/carousel_${postId}_slide_1.svg`;

      // Run Quality Control audit
      const qcResult = QualityControlGuard.auditPost({
        title: item.title,
        hook: item.hook,
        content: item.content,
        hashtags: item.hashtags,
        content_format: item.format,
        pillar_slug: item.pillarSlug
      });

      // Insert post
      db.prepare(`
        INSERT INTO generated_posts (
          id, pillar_id, project_id, title, hook, content, hashtags,
          audience_question, first_comment, intended_audience, content_format,
          source_links, status, scheduled_date, scheduled_time_wat, quality_score,
          duplicate_similarity_score, image_prompt, image_url, carousel_slides
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        postId,
        pillarId,
        item.projectRef,
        item.title,
        item.hook,
        item.content,
        item.hashtags,
        item.question,
        item.firstComment,
        item.audience,
        item.format,
        JSON.stringify(item.sources),
        'pending_approval',
        scheduledDateStr,
        item.timeWAT,
        qcResult.quality_score,
        qcResult.duplicate_similarity,
        item.imagePrompt,
        distinctImageUrl,
        JSON.stringify(carouselSlides)
      );

      // Insert initial version
      db.prepare(`
        INSERT INTO content_versions (id, post_id, version_number, content, hook, changed_by, reason)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        `ver-${crypto.randomUUID().slice(0, 8)}`,
        postId,
        1,
        item.content,
        item.hook,
        'ContentGeneratorEngine',
        'Initial weekly calendar generation'
      );

      // Queue publishing schedule
      const scheduledIso = `${scheduledDateStr} ${item.timeWAT}:00`;
      db.prepare(`
        INSERT INTO publishing_schedule (id, post_id, scheduled_for_wat, status)
        VALUES (?, ?, ?, ?)
      `).run(
        `sched-${crypto.randomUUID().slice(0, 8)}`,
        postId,
        scheduledIso,
        'queued'
      );

      generatedPosts.push({
        id: postId,
        scheduled_date: scheduledDateStr,
        scheduled_time_wat: item.timeWAT,
        ...item,
        image_url: distinctImageUrl,
        quality_score: qcResult.quality_score,
        status: 'pending_approval'
      });
    }

    // Log automation event
    db.prepare(`
      INSERT INTO automation_logs (id, agent_name, action, details, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `log-${crypto.randomUUID().slice(0, 8)}`,
      'Content Generation Engine',
      'WEEKLY_CALENDAR_GENERATED',
      `Generated 5 comprehensive posts for week starting ${baseDate.toISOString().split('T')[0]} with 100% human-in-the-loop approval lock.`,
      'success'
    );

    return generatedPosts;
  }

  static getNextMonday() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + ((7 - day + 1) % 7 || 7);
    const nextMon = new Date(d.setDate(diff));
    return nextMon;
  }

  static getCalendarPosts() {
    const rows = db.prepare(`
      SELECT p.*, cp.name as pillar_name, cp.slug as pillar_slug, pr.title as project_title
      FROM generated_posts p
      LEFT JOIN content_pillars cp ON p.pillar_id = cp.id
      LEFT JOIN projects pr ON p.project_id = pr.id
      ORDER BY p.scheduled_date ASC, p.scheduled_time_wat ASC
    `).all();

    return rows.map(p => {
      let slides = [];
      if (p.carousel_slides) {
        try { slides = JSON.parse(p.carousel_slides); } catch (_) {}
      }
      if (!slides || slides.length === 0) {
        slides = p.image_url ? [p.image_url] : [];
      }
      return { ...p, carousel_slides: slides };
    });
  }

  static getPostById(id) {
    const p = db.prepare(`
      SELECT p.*, cp.name as pillar_name, cp.slug as pillar_slug, pr.title as project_title
      FROM generated_posts p
      LEFT JOIN content_pillars cp ON p.pillar_id = cp.id
      LEFT JOIN projects pr ON p.project_id = pr.id
      WHERE p.id = ?
    `).get(id);

    if (!p) return null;

    let slides = [];
    if (p.carousel_slides) {
      try { slides = JSON.parse(p.carousel_slides); } catch (_) {}
    }
    if (!slides || slides.length === 0) {
      slides = p.image_url ? [p.image_url] : [];
    }
    return { ...p, carousel_slides: slides };
  }

  static updatePost(id, { content, hook, title, hashtags, scheduled_date, scheduled_time_wat }) {
    const existing = this.getPostById(id);
    if (!existing) throw new Error('Post not found');

    // Get current version count
    const verCount = db.prepare('SELECT COUNT(*) as count FROM content_versions WHERE post_id = ?').get(id).count;

    // Insert version history
    db.prepare(`
      INSERT INTO content_versions (id, post_id, version_number, content, hook, changed_by, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `ver-${crypto.randomUUID().slice(0, 8)}`,
      id,
      verCount + 1,
      content,
      hook,
      'Human Editor',
      'User revised post copy in Approval Center'
    );

    // Update post record
    db.prepare(`
      INSERT OR REPLACE INTO generated_posts (
        id, pillar_id, project_id, title, hook, content, hashtags,
        audience_question, first_comment, intended_audience, content_format,
        source_links, status, scheduled_date, scheduled_time_wat, quality_score,
        duplicate_similarity_score, image_prompt, image_url, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')
      )
    `).run(
      id,
      existing.pillar_id,
      existing.project_id,
      title || existing.title,
      hook || existing.hook,
      content || existing.content,
      hashtags || existing.hashtags,
      existing.audience_question,
      existing.first_comment,
      existing.intended_audience,
      existing.content_format,
      existing.source_links,
      existing.status,
      scheduled_date || existing.scheduled_date,
      scheduled_time_wat || existing.scheduled_time_wat,
      existing.quality_score,
      existing.duplicate_similarity_score,
      existing.image_prompt,
      existing.image_url
    );

    return this.getPostById(id);
  }

  static setPostApproval(id, decision, feedback = '') {
    const post = this.getPostById(id);
    if (!post) throw new Error('Post not found');

    const newStatus = decision === 'approved' ? 'approved' : decision === 'rejected' ? 'rejected' : 'revision_requested';

    db.prepare("UPDATE generated_posts SET status = ?, updated_at = datetime('now') WHERE id = ?").run(newStatus, id);

    db.prepare(`
      INSERT INTO content_approvals (id, post_id, decision, feedback, reviewer_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `appr-${crypto.randomUUID().slice(0, 8)}`,
      id,
      decision,
      feedback,
      'Toluwanimi Akinyemi'
    );

    // If approved, update publishing schedule
    if (decision === 'approved') {
      db.prepare("UPDATE publishing_schedule SET status = 'queued' WHERE post_id = ?").run(id);
    } else {
      db.prepare("UPDATE publishing_schedule SET status = 'paused' WHERE post_id = ?").run(id);
    }

    // Automatically create another post for approval if rejected
    let replacementPost = null;
    if (decision === 'rejected') {
      try {
        replacementPost = this.createAnotherPostForApproval({
          basePost: post,
          trigger: 'rejection',
          instructions: feedback
        });
      } catch (err) {
        console.error('Failed to auto-generate replacement post on rejection:', err);
      }
    }

    const updated = this.getPostById(id);
    if (replacementPost) {
      updated.replacementPost = replacementPost;
    }
    return updated;
  }

  /**
   * Autonomously creates another high-impact post in 'pending_approval'
   * whenever a post is rejected or revamped.
   */
  static createAnotherPostForApproval({ basePost, trigger = 'rejection', instructions = '' } = {}) {
    // 1. Curated technical topic pool reflecting Toluwanimi Akinyemi's profile & verified experience
    const candidatePool = [
      {
        pillarSlug: 'telecom-noc',
        format: 'Technical Deep-Dive',
        title: 'How IoT RMS Telemetry Prevents 48V Battery Depletion Before Site Failure',
        hook: `When commercial power collapses on a remote cell site, the 48V DC battery bank is the last line of defense.\nHere is how we automate RMS voltage threshold monitoring across 789+ nodes to prevent catastrophic outages:`,
        content: `When commercial power collapses on a remote cell site, the 48V DC battery bank is the last line of defense.
Here is how we automate RMS voltage threshold monitoring across 789+ nodes to prevent catastrophic outages:

In mission-critical telecommunications surveillance, every battery discharge follows a predictable voltage curve.
Yet without automated telemetry, technicians are often dispatched after the rectifier drops below 42V—when the site has already gone dark.

Here is the 3-step automated protocol we use:

1. Telemetry Ingress via Galooli RMS.
Every 60 seconds, auxiliary sensors push DC bus voltage, ambient battery temperature, and generator fuel levels directly into our surveillance cluster.

2. Automated Threshold Segmentation.
We filter transient voltage dips caused by generator starter motor cranks from real deep-discharge emergencies.
This filters out 80% of spurious alarms.

3. Predictive 48-Hour Rectifier Warning.
By tracking internal cell resistance deltas over 14-day rolling windows, we identify failing rectifiers 48 hours before hardware burnout.

Operational reliability isn't firefighting emergencies.
It is turning predictable hardware decay into deterministic, pre-emptive maintenance.

How does your engineering team automate anomaly detection before systems breach SLA?`,
        hashtags: '#Telecommunications #IoT #NetworkOperations #ReliabilityEngineering #Infrastructure',
        question: 'How does your engineering team automate anomaly detection before systems breach SLA?',
        firstComment: 'Filtering transient generator crank sags from true battery exhaustion dropped our nocturnal alarm fatigue by over 50%.',
        audience: 'NOC Engineers, Telecom SREs, Infrastructure Directors, IoT Developers',
        sources: ['https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx'],
        projectRef: 'proj-noc-pan-african',
        imagePrompt: 'A crisp technical diagram illustrating 48V battery bank telemetry and Galooli RMS automated alarm filtering in dark navy and cyan.'
      },
      {
        pillarSlug: 'ai-automation',
        format: 'Architecture & Best Practices',
        title: 'Why Strict JSON Schemas Are the First Line of Defense in AI Automation',
        hook: `An AI agent that outputs free-form text into a production database is an outage waiting to happen.\nHere is how strict JSON Schema validation acts as our first line of defense:`,
        content: `An AI agent that outputs free-form text into a production database is an outage waiting to happen.
Here is how strict JSON Schema validation acts as our first line of defense:

Over the past few months building automated workflows in n8n, Make.com, and the Google Gemini API, one lesson stood out above all others:
LLM hallucination is a product failure; schema validation failure is an engineering failure.

Here is how we enforce deterministic execution across AI pipelines:

1. Constrained Output Generation.
Never ask an LLM to "format your answer nicely."
Pass an explicit JSON Schema defining exact object keys, required properties, and string constraints before invocation.

2. Two-Stage Payload Verification.
When the payload returns from the Gemini API, our webhook worker validates every field against type rules before passing parameters to Supabase.

3. Automated Fallback Circuit Breakers.
If an external API payload misses a required field, execution routes immediately into a deterministic recovery queue with on-call alerting.

Intelligence without guardrails is a liability.
Enforce the boundaries first, and the model will execute reliably.

What validation safeguards do you place between your AI models and production databases?`,
        hashtags: '#AIAutomation #SoftwareArchitecture #JSONSchema #SystemReliability #AIEngineering',
        question: 'What validation safeguards do you place between your AI models and production databases?',
        firstComment: 'We treat LLM outputs exactly like untrusted external user inputs: validate, sanitize, and enforce types before any state mutation.',
        audience: 'AI Engineers, Workflow Architects, Backend Developers, CTOs',
        sources: ['https://json-schema.org/understanding-json-schema/'],
        projectRef: 'proj-expenseiq',
        imagePrompt: 'A modern technical architectural blueprint showing strict JSON Schema validation acting as a firewall between LLMs and databases.'
      },
      {
        pillarSlug: 'projects-demos',
        format: 'Project Case Study',
        title: 'Inside ExpenseIQ: From 18-Minute Manual Reviews to 10-Second Automated Audits',
        hook: `Finance teams spend an average of 18 minutes manually auditing every corporate receipt.\nHere is how we built ExpenseIQ to automate multi-tenant compliance in under 10 seconds:`,
        content: `Finance teams spend an average of 18 minutes manually auditing every corporate receipt.
Here is how we built ExpenseIQ to automate multi-tenant compliance in under 10 seconds:

Cross-border expenses in Nigeria and emerging markets face a dual challenge:
Multiple currencies, non-standard receipt formats, and strict corporate tax compliance rules.

Here is the technical architecture behind ExpenseIQ:

1. Responsive Multi-Tenant Interface.
Engineered with Lovable to give mobile employees instant camera receipt ingestion and budget tracking.

2. Multimodal OCR & Line-Item Extraction.
Powered by the Google Gemini API to extract merchant name, tax identifiers, line items, and VAT totals with 98.4% precision.

3. Row-Level Security (RLS) in Supabase.
Each tenant organization is isolated at the database engine level, ensuring audit logs and expense receipts remain strictly confidential.

4. Deterministic Compliance Auditing.
Flagging duplicate claims, weekend expenses, and threshold violations automatically before manager sign-off.

Automation isn't just about saving time.
It is about building audit trails that eliminate financial blind spots.

What is the most friction-heavy operational process your finance or operations team still runs manually?`,
        hashtags: '#FinTech #AIAutomation #ExpenseManagement #Supabase #ProductEngineering',
        question: 'What is the most friction-heavy operational process your finance or operations team still runs manually?',
        firstComment: 'Live demo accounts for ExpenseIQ are accessible for testing: username test@expenseiq.com, password test@1234.',
        audience: 'Finance Directors, Operations Leads, Startup Founders, Product Engineers',
        sources: ['https://www.toluwanimi-main-portfolio.vercel.app'],
        projectRef: 'proj-expenseiq',
        imagePrompt: 'A sleek SaaS product dashboard and data pipeline architecture showing ExpenseIQ receipt processing with Supabase RLS in emerald and dark slate.'
      },
      {
        pillarSlug: 'industry-insights',
        format: 'Industry Commentary',
        title: '300 Alarms to 1 Root Cause: How Edge Telemetry Solves NOC Alert Fatigue',
        hook: `During a major fiber backhaul cut, 300 cell towers trigger alarms simultaneously.\nHere is how automated incident correlation saves dispatch engineers hours of confusion:`,
        content: `During a major fiber backhaul cut, 300 cell towers trigger alarms simultaneously.
Here is how automated incident correlation saves dispatch engineers hours of confusion:

In network operations surveillance across 789+ nodes, the most dangerous enemy isn't system failure.
It is alert fatigue.

When hundreds of alarms blare at 2:00 AM, human cognitive bandwidth collapses.
Is it 300 individual power faults? Or one cut fiber cable feeding the whole ring?

Here is how intelligent alarm correlation changes the equation:

1. Topology-Aware Dependency Mapping.
Every cell tower is mapped to its parent aggregation node, fiber backhaul, and auxiliary power feed.

2. Rapid Ingestion & Temporal Clustering.
When 50+ alarms arrive within a 45-second window along the same transmission route, our logic groups them into a single parent incident.

3. Automated Dispatch Enrichment.
Instead of sending 20 field technicians to 20 different towers, the system routes one fiber repair crew directly to the break coordinates with GPS telemetry.

The result?
Mean Time to Repair (MTTR) drops by 30%, and on-call engineers keep their focus on true root causes.

How does your observability stack handle cascade alert storms?`,
        hashtags: '#Telecommunications #Observability #IncidentResponse #SRE #SystemsThinking',
        question: 'How does your observability stack handle cascade alert storms?',
        firstComment: 'The best monitoring system is not the one with the most alerts. It is the one that tells you exactly where to send the screwdriver.',
        audience: 'SREs, Telecom Operators, DevOps Leads, Infrastructure Architects',
        sources: ['https://spectrum.ieee.org/telecom-ai-automation'],
        projectRef: 'proj-noc-pan-african',
        imagePrompt: 'An amber and dark slate engineering schematic illustrating 300 cascade alarms correlated down to one root cause incident.'
      },
      {
        pillarSlug: 'thought-leadership',
        format: 'Engineering Strategy',
        title: 'The T-Shaped AI Generalist: Why Domain Rigor Beats Generic Automation Tutorials',
        hook: `Anyone can wire an n8n webhook after watching a 10-minute video.\nVery few people understand how to keep a 789-node telecom network at 99.8% SLA uptime.\nHere is why domain depth supercharges AI automation:`,
        content: `Anyone can wire an n8n webhook after watching a 10-minute video.
Very few people understand how to keep a 789-node telecom network at 99.8% SLA uptime.
Here is why domain depth supercharges AI automation:

The modern tech landscape is filled with "toy automations"—fragile scripts that look great on Twitter but break on the first real-world edge case.

The engineers who deliver true production value are T-Shaped AI Generalists:

1. The Deep Vertical Stem: Battle-Tested Domain Discipline.
Years in mission-critical NOC surveillance teach you to design for power cuts, sensor noise, network latency, and strict SLAs.
You understand that downtime has severe financial and physical consequences.

2. The Broad Horizontal Bar: Modern AI & Cloud Agility.
Over the past few months learning and applying n8n, Make.com, the Google Gemini API, Supabase, and Lovable, connecting tools has become second nature.

3. The Intersection: Practical, Resilient Automation.
When deep operational discipline meets modern AI tools, you don't build toys.
You build deterministic, audited, production-grade workflows that drive business uptime.

Tools and frameworks will shift every six months.
The ability to analyze a complex operational breakdown and architect a reliable system is an enduring engineering capability.

What domain expertise are you combining with modern AI tools right now?`,
        hashtags: '#AIGeneralist #CareerStrategy #EngineeringLeadership #ContinuousLearning #SystemsThinking',
        question: 'What domain expertise are you combining with modern AI tools right now?',
        firstComment: 'My foundation in pure mathematics and statistics grounds my automation work: before writing a single rule, understand the underlying distribution.',
        audience: 'Engineering Managers, AI Builders, Tech Leads, Early-Career Engineers',
        sources: ['https://www.toluwanimi-main-portfolio.vercel.app'],
        projectRef: 'proj-expenseiq',
        imagePrompt: 'An indigo and violet architectural schematic illustrating the T-shaped generalist model with deep operational anchor and broad AI wings.'
      },
      {
        pillarSlug: 'telecom-noc',
        format: 'Operational Playbook',
        title: 'Standardizing Incident Triage: How Codified Failure Signatures Cut MTTR by 30%',
        hook: `If your engineering team solves the same outage twice from scratch, you have an operational leak.\nHere is how codifying failure signatures cut our regional MTTR by 30%:`,
        content: `If your engineering team solves the same outage twice from scratch, you have an operational leak.
Here is how codifying failure signatures cut our regional MTTR by 30%:

Across 789+ nodes at Pan African Towers, recurring incidents were historically a major source of delay.
A technician on shift A would spend 90 minutes diagnosing an intermittent rectifier ground fault.
Two days later on shift B, a different engineer would start from square one.

Here is the standardized incident triage protocol we instituted:

1. Digital Failure Fingerprinting.
We mapped our top 15 most frequent outage modes to distinct telemetry signatures: battery thermal delta, DC voltage drop rates, and generator starter feedback.

2. Automated Diagnostic Checklists.
The moment an alarm fires, the surveillance system attaches the exact diagnostic decision tree to the internal dispatch ticket.

3. Closing the Feedback Loop.
Post-incident RCA isn't filed away in a drawer. If an outage uncovered a new failure vector, the alert rules were updated within 24 hours.

Standardizing triage isn't about bureaucracy.
It is about freeing your engineers from repetitive diagnosis so they can focus on high-value system enhancements.

How does your team document and codify failure signatures so lessons stick across shifts?`,
        hashtags: '#NetworkOperations #MTTR #IncidentManagement #Reliability #ProcessOptimization',
        question: 'How does your team document and codify failure signatures so lessons stick across shifts?',
        firstComment: 'The best operational teams do not rely on hero technicians. They build systems where standard procedures make everyone perform like an expert.',
        audience: 'Operations Managers, Site Reliability Engineers, Telecom Leads, NOC Analysts',
        sources: ['https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx'],
        projectRef: 'proj-noc-pan-african',
        imagePrompt: 'A clean incident triage workflow and failure signature decision tree in cyan and slate navy.'
      }
    ];

    // 2. Fetch existing post titles in DB to guarantee zero duplicate titles
    const existingTitles = new Set(
      db.prepare("SELECT LOWER(TRIM(title)) as t FROM generated_posts").all().map(r => r.t)
    );

    // 3. Filter candidates that are NOT yet in the database
    let available = candidatePool.filter(c => !existingTitles.has(c.title.toLowerCase().trim()));

    // Prefer candidates matching basePost pillar if available
    let candidate = null;
    if (basePost && basePost.pillar_slug) {
      candidate = available.find(c => c.pillarSlug === basePost.pillar_slug);
    }
    if (!candidate && available.length > 0) {
      candidate = available[0];
    }

    // Fallback: if all candidate titles exist, generate a numbered operational variation
    if (!candidate) {
      const baseCandidate = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      const salt = crypto.randomUUID().slice(0, 4).toUpperCase();
      candidate = {
        ...baseCandidate,
        title: `${baseCandidate.title} (Field Case #${salt})`,
        hook: `[Operational Case #${salt}] ${baseCandidate.hook}`
      };
    }

    // 4. Resolve pillar info
    const pillarRow = db.prepare('SELECT id, name FROM content_pillars WHERE slug = ?').get(candidate.pillarSlug);
    const pillarId = pillarRow ? pillarRow.id : (basePost ? basePost.pillar_id : 'pillar-1');
    const pillarName = pillarRow ? pillarRow.name : 'AI Automation';

    // 5. Determine calendar slot
    let targetDateStr = '';
    let targetTimeStr = '08:30';

    if (trigger === 'rejection' && basePost) {
      // Replaces the exact slot of the rejected post
      targetDateStr = basePost.scheduled_date || new Date().toISOString().split('T')[0];
      targetTimeStr = basePost.scheduled_time_wat || '08:15';
    } else {
      // For revamp companion: scheduled as alternative candidate or next day
      if (basePost && basePost.scheduled_date) {
        targetDateStr = basePost.scheduled_date;
        targetTimeStr = basePost.scheduled_time_wat === '08:15' ? '09:00' : '08:15';
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        targetDateStr = d.toISOString().split('T')[0];
        targetTimeStr = '08:30';
      }
    }

    const postId = `post-${crypto.randomUUID().slice(0, 8)}`;

    // 6. Generate distinct 5-slide technical carousel tailored to this post
    const carouselSlides = DynamicCarouselGenerator.generateCarousel({
      postId,
      title: candidate.title,
      hook: candidate.hook,
      content: candidate.content,
      pillarSlug: candidate.pillarSlug,
      pillarName,
      contentFormat: candidate.format,
      hashtags: candidate.hashtags,
      audienceQuestion: candidate.question
    });
    const distinctImageUrl = carouselSlides[0] || `/media/carousel_${postId}_slide_1.svg`;

    // 7. Quality control verification
    const qcResult = QualityControlGuard.auditPost({
      title: candidate.title,
      hook: candidate.hook,
      content: candidate.content,
      hashtags: candidate.hashtags,
      content_format: candidate.format,
      pillar_slug: candidate.pillarSlug
    });

    // 8. Insert into generated_posts with status = 'pending_approval'
    db.prepare(`
      INSERT INTO generated_posts (
        id, pillar_id, project_id, title, hook, content, hashtags,
        audience_question, first_comment, intended_audience, content_format,
        source_links, status, scheduled_date, scheduled_time_wat, quality_score,
        duplicate_similarity_score, image_prompt, image_url, carousel_slides
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      postId,
      pillarId,
      candidate.projectRef,
      candidate.title,
      candidate.hook,
      candidate.content,
      candidate.hashtags,
      candidate.question,
      candidate.firstComment,
      candidate.audience,
      candidate.format,
      JSON.stringify(candidate.sources),
      'pending_approval',
      targetDateStr,
      targetTimeStr,
      qcResult.quality_score,
      qcResult.duplicate_similarity,
      candidate.imagePrompt,
      distinctImageUrl,
      JSON.stringify(carouselSlides)
    );

    // 9. Record initial version
    const reasonText = trigger === 'rejection'
      ? `Auto-generated replacement post for approval (rejected post: ${basePost ? basePost.id : 'unknown'})`
      : `Auto-generated companion post for approval following revamp of ${basePost ? basePost.id : 'unknown'}`;

    db.prepare(`
      INSERT INTO content_versions (id, post_id, version_number, content, hook, changed_by, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `ver-${crypto.randomUUID().slice(0, 8)}`,
      postId,
      1,
      candidate.content,
      candidate.hook,
      'Autonomous Content Engine',
      reasonText
    );

    // 10. Queue in publishing schedule
    const scheduledIso = `${targetDateStr} ${targetTimeStr}:00`;
    db.prepare(`
      INSERT INTO publishing_schedule (id, post_id, scheduled_for_wat, status)
      VALUES (?, ?, ?, ?)
    `).run(
      `sched-${crypto.randomUUID().slice(0, 8)}`,
      postId,
      scheduledIso,
      'queued'
    );

    // 11. Log automation event
    db.prepare(`
      INSERT INTO automation_logs (id, agent_name, action, details, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `log-${crypto.randomUUID().slice(0, 8)}`,
      'Autonomous Content Engine',
      trigger === 'rejection' ? 'REPLACEMENT_POST_CREATED' : 'COMPANION_POST_CREATED',
      `${trigger === 'rejection' ? 'Replacement' : 'Companion'} post "${candidate.title}" auto-created for approval in slot ${targetDateStr} @ ${targetTimeStr} WAT.`,
      'success'
    );

    return this.getPostById(postId);
  }

  static async revampPost(id, instructions) {
    if (!instructions || !instructions.trim()) {
      throw new Error('Please provide instructions for what you would like to revamp.');
    }

    const post = this.getPostById(id);
    if (!post) throw new Error('Post not found');

    const cleanInstructions = instructions.trim();
    let revisedTitle = post.title;
    let revisedHook = post.hook;
    let revisedContent = post.content.replace(/\n*\[Revised Note\]:?[^\n]*/gi, '').trim();
    let revisedQuestion = post.audience_question || '';
    let revisedImageUrl = post.image_url;
    let revisedImagePrompt = post.image_prompt;

    const isVisualChange = /\b(picture|image|graphic|visual|diagram|illustration|photo|draw|infographic|details of the picture)\b/i.test(cleanInstructions);

    if (isVisualChange) {
      try {
        const generatedPath = DynamicVisualGenerator.generateDistinctGraphic({
          postId: post.id,
          title: revisedTitle,
          pillarSlug: post.pillar_slug || 'ai-automation',
          pillarName: post.pillar_name || 'AI Automation',
          contentFormat: post.content_format || 'Architecture'
        });
        revisedImageUrl = `${generatedPath}?v=${Date.now()}`;
        revisedImagePrompt = `Distinct technical visualization for: ${revisedTitle} (${post.pillar_name}). Clean vector architecture diagram with zero overlapping details.`;
      } catch (err) {
        console.error('Failed to regenerate visual for revamp:', err);
      }
    }

    // Check if Gemini API is available for live multimodal/LLM rewrite
    const apiKey = process.env.GEMINI_API_KEY;
    let usedAi = false;

    if (apiKey) {
      try {
        const prompt = `You are the AI personal branding assistant for Toluwanimi Akinyemi (Telecommunications Network Operations Engineer & AI Automation Engineer).
Profile Context:
- Profession: Telecommunications NOC Engineer managing 789+ nodes with 99.8% SLA uptime.
- AI Automation: Active learner who began building AI workflows (n8n, Make.com, Gemini API, Supabase, Lovable) a few months ago. Never invent multi-year AI tenure.
- Excluded tools: Never mention React or Tailwind CSS.
- Tone: Conversational, crisp, authoritative engineering, short mobile paragraphs, no corporate fluff.

Original Post Title: "${post.title}"
Original Hook:
"${post.hook}"

Original Post Body:
"${post.content}"

User's Revamp Instructions:
"${cleanInstructions}"

Task: Revise the post strictly according to the user's instructions while preserving brand voice and verified facts.
Respond with ONLY valid JSON with this schema:
{
  "title": "revised title",
  "hook": "revised opening hook (1-2 punchy lines, <200 chars)",
  "content": "full revised post body formatted for mobile with double line breaks between thoughts",
  "audience_question": "revised ending question"
}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
          if (parsed.content) {
            revisedTitle = parsed.title || revisedTitle;
            revisedHook = parsed.hook || revisedHook;
            revisedContent = parsed.content;
            revisedQuestion = parsed.audience_question || revisedQuestion;
            usedAi = true;
          }
        }
      } catch (e) {
        console.warn('Gemini API revamp call failed, falling back to intelligent rule refiner:', e.message);
      }
    }

    if (!usedAi) {
      // Intelligent deterministic refiner
      const lowerInst = cleanInstructions.toLowerCase();

      if (lowerInst.includes('hook') || lowerInst.includes('opening')) {
        // Targeted hook rewrite with word boundaries
        const match = cleanInstructions.match(/\b(?:to|as|into|saying|say|about|focusing on|centered on)\b\s*[:"']?([^"']+)["']?$/i);
        let newHookText = match ? match[1].trim() : cleanInstructions;
        if (/^(make|change|rewrite)\b/i.test(newHookText)) {
          newHookText = `In mission-critical telecom operations across 789+ nodes, uptime is never an accident—it is built on deterministic automation.`;
        }
        revisedHook = newHookText;
        
        const paragraphs = revisedContent.split(/\n\s*\n/);
        paragraphs[0] = newHookText;
        revisedContent = paragraphs.join('\n\n');
      } else if (lowerInst.includes('question') || lowerInst.includes('cta') || lowerInst.includes('call to action')) {
        // Targeted question rewrite with word boundaries
        const match = cleanInstructions.match(/\b(?:to|as|into|saying|ask)\b\s*[:"']?([^"']+)["']?$/i);
        const newQuestion = match ? match[1].trim() : cleanInstructions;
        revisedQuestion = newQuestion;
        
        const lines = revisedContent.trim().split('\n');
        lines[lines.length - 1] = newQuestion;
        revisedContent = lines.join('\n');
      } else if (!isVisualChange) {
        // General text refinement: weave requested guidance smoothly without bracketed notes
        const paragraphs = revisedContent.split(/\n\s*\n/);
        const refinedAddition = `Key refinement: ${cleanInstructions.replace(/^(please|can you|kindly|i want to)\s*/i, '')}.`;
        if (paragraphs.length >= 3) {
          paragraphs.splice(paragraphs.length - 2, 0, refinedAddition);
          revisedContent = paragraphs.join('\n\n');
        } else {
          revisedContent = `${revisedContent}\n\n${refinedAddition}`;
        }
      }
    }

    // Run QC audit to ensure no forbidden words or timeline hallucinations
    const qcAudit = QualityControlGuard.auditPost({
      title: revisedTitle,
      hook: revisedHook,
      content: revisedContent,
      hashtags: post.hashtags,
      content_format: post.content_format,
      pillar_slug: post.pillar_slug || 'ai-automation'
    });

    // Get current version count
    const verCount = db.prepare('SELECT COUNT(*) as count FROM content_versions WHERE post_id = ?').get(id).count;

    // Save to content_versions
    db.prepare(`
      INSERT INTO content_versions (id, post_id, version_number, content, hook, changed_by, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `ver-${crypto.randomUUID().slice(0, 8)}`,
      id,
      verCount + 1,
      revisedContent,
      revisedHook,
      'Revamp Agent (Human Directed)',
      cleanInstructions
    );

    // Regenerate 5-slide carousel to reflect revamped copy and hook
    let revampedSlides = [];
    try {
      revampedSlides = DynamicCarouselGenerator.generateCarousel({
        postId: id,
        title: revisedTitle,
        hook: revisedHook,
        content: revisedContent,
        pillarSlug: post.pillar_slug || 'ai-automation',
        pillarName: post.pillar_name || 'AI Automation',
        contentFormat: post.content_format || 'Technical',
        hashtags: post.hashtags || '',
        audienceQuestion: revisedQuestion
      });
      if (revampedSlides && revampedSlides.length > 0) {
        revisedImageUrl = revampedSlides[0];
      }
    } catch (e) {
      console.warn('Carousel regeneration warning on revamp:', e.message);
    }

    // Update generated_posts
    db.prepare(`
      UPDATE generated_posts
      SET title = ?, hook = ?, content = ?, audience_question = ?, image_url = ?, image_prompt = ?, carousel_slides = ?, quality_score = ?, status = 'pending_approval', updated_at = datetime('now')
      WHERE id = ?
    `).run(
      revisedTitle,
      revisedHook,
      revisedContent,
      revisedQuestion,
      revisedImageUrl,
      revisedImagePrompt,
      revampedSlides.length ? JSON.stringify(revampedSlides) : post.carousel_slides,
      qcAudit.quality_score,
      id
    );

    // Log approval / revamp action
    db.prepare(`
      INSERT INTO content_approvals (id, post_id, decision, feedback, reviewer_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `appr-${crypto.randomUUID().slice(0, 8)}`,
      id,
      'revamped',
      cleanInstructions,
      'Toluwanimi Akinyemi'
    );

    // Automation log
    db.prepare(`
      INSERT INTO automation_logs (id, agent_name, action, details, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `log-${crypto.randomUUID().slice(0, 8)}`,
      'Revamp Engine',
      'POST_REVAMPED',
      `Revamped post "${revisedTitle.slice(0, 30)}..." based on instruction: "${cleanInstructions.slice(0, 60)}"`,
      'success'
    );

    // Automatically create another companion post for approval upon revamp
    let newPost = null;
    try {
      newPost = this.createAnotherPostForApproval({
        basePost: this.getPostById(id),
        trigger: 'revamp',
        instructions: cleanInstructions
      });
    } catch (err) {
      console.error('Failed to auto-generate companion post on revamp:', err);
    }

    const updated = this.getPostById(id);
    if (newPost) {
      updated.newPost = newPost;
    }
    return updated;
  }
}
