# Autonomous LinkedIn Personal Branding & Content Automation Platform

**Built for:** Toluwanimi Akinyemi  
**Primary Profession:** Telecommunications Network Operations Engineer & AI Automation Engineer  
**Timezone:** West Africa Time (WAT / UTC+1)  
**LinkedIn URN:** `urn:li:person:-XwFu54idT`  
**Portfolio:** [https://www.toluwanimi-main-portfolio.vercel.app](https://www.toluwanimi-main-portfolio.vercel.app)  
**ExpenseIQ:** [https://expense-ai-pro-14.lovable.app/login](https://expense-ai-pro-14.lovable.app/login)

---

## 1. Executive Summary

This platform is a fully autonomous, production-minded personal branding system that positions Toluwanimi Akinyemi as a leading telecommunications operational engineer, AI automation engineer, and developing AI Generalist.

Unlike superficial AI copy generators, this system:
1. **Discovers and builds real technical demonstration projects** autonomously (with synthetic telemetry, system architectures, and runnable code) so you never run out of substantive things to talk about.
2. **Conducts weekly industry research** and enforces a strict **Fact-Checking Agent** that prevents hallucinated credentials, employment history, or fake metrics.
3. **Generates a complete 5-day Monday–Friday content calendar** mapped across 6 strategic pillars in West Africa Time (WAT).
4. **Enforces mandatory human-in-the-loop approval:** no post or comment is ever published without your explicit authorization.
5. **Includes a global Emergency Automation Pause Switch** that instantaneously blocks all outbound network transmissions.

---

## 2. Architecture & Technology Stack

- **Backend Runtime:** Node.js v24.22.0 (ES Modules).
- **Database Engine:** `node:sqlite` (SQLite 3 embedded synchronous database in `data/platform.db`, requiring zero external native compilation).
- **API Framework:** Express.js + CORS.
- **Frontend UI:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
- **Social Media API Integration:** Composio LinkedIn OAuth 2.0 UGC API (`/v2/ugcPosts`, `feedshare-image` recipe).

---

## 3. Database Schema (20 Tables)

The persistent database is initialized in `data/platform.db` with 20 relational tables:

1. `profiles`: Core identity, emergency pause flag, verified bio, contact information.
2. `brand_memory`: Professional boundaries, verified metrics (789+ nodes, 99.8% SLA), banned AI clichés.
3. `projects`: Real, prototype, and simulated projects with problem statements, architecture, and tech stacks.
4. `project_tasks`: Subtasks required to bring an autonomous project demonstration to completion.
5. `project_evidence`: Synthetic datasets, Mermaid architecture diagrams, benchmarks, and schemas.
6. `content_pillars`: The 6 strategic pillars with target post allocations and weights.
7. `content_ideas`: Idea pipeline mapped by pillar and real-world operational challenges.
8. `generated_posts`: Weekly drafts containing all 15 required content fields.
9. `content_versions`: Complete audit trail of copy revisions and human edits.
10. `content_approvals`: Explicit human approval logs (reviewer, timestamp, decision, feedback).
11. `publishing_schedule`: Scheduled dispatches configured for West Africa Time (WAT).
12. `media_assets`: Image prompts, raster assets, and infographics tied to posts.
13. `published_posts`: Permanent records of live LinkedIn shares (`share_urn`, permalink).
14. `engagement_metrics`: Impressions, reactions, comments, reposts, and engagement rates.
15. `notification_logs`: WAT notification log (Sunday prep, Monday approval, Wednesday check, Friday review).
16. `research_sources`: Verified technical articles, documentation, whitepapers, and URLs.
17. `fact_checking_audits`: Claims auditing and anti-hallucination verification records.
18. `comment_drafts`: AI-suggested multi-style comment responses (Technical, Professional, Friendly).
19. `professional_leads`: Inbound career opportunities, consulting inquiries, and recruiter contacts.
20. `automation_logs`: Auditing trail of every autonomous agent action and execution result.

---

## 4. The 6 Strategic Content Pillars

| Pillar ID | Pillar Name | Strategic Objective | Weekly Cadence |
| :--- | :--- | :--- | :--- |
| **Pillar 1** | **AI Automation** | Make.com, n8n, AI agents, deterministic guardrails, database & API integrations. | 1 post / week |
| **Pillar 2** | **Telecommunications & NOC** | 789+ tower surveillance, 99.8% SLA, root-cause analysis, alarm filtering, voltage drops. | 1 post / week |
| **Pillar 3** | **Projects & Demonstrations** | ExpenseIQ development, NOC Incident Assistant, architecture diagrams, code breakdowns. | 1 post / week |
| **Pillar 4** | **Professional Development** | Transition to AI Generalist, combining deep domain expertise with modern AI agility. | 1 post / week |
| **Pillar 5** | **Industry Insights** | Hybrid grid power trends, edge computing, AI telecommunications standards. | 1 post / week |
| **Pillar 6** | **Engagement & Thought Leadership**| SRE operational debates, practical lessons, questions that stimulate executive discussion. | Rotating |

---

## 5. Security & Safety Gates

### 1. Mandatory Human Approval Lock
Every generated post enters the database with `status = 'pending_approval'`.
If any process attempts to invoke `LinkedInPublisherAgent.publishPost()` on an unapproved post, the system immediately throws:
```
APPROVAL_REQUIRED: Post status is "pending_approval". Human approval is mandatory before publishing.
```

### 2. Emergency Automation Pause Switch
A prominent red toggle button in the dashboard controls `profiles.emergency_pause_active`.
When active:
- Every scheduled publication immediately halts.
- All outbound publishing endpoints throw:
  ```
  EMERGENCY_PAUSE_ACTIVE: Publishing halted by emergency pause switch.
  ```
- All pending drafts, evidence, and approvals remain safely stored in the database.

### 3. Anti-Hallucination & Quality Control Guard (`qcGuard.js`)
- **Duplicate Similarity:** Calculates Jaccard token overlap against all past posts. If similarity $\ge 45\%$, flags duplicate rejection.
- **Hook Mobile Truncation:** Ensures opening hooks stay under 200 characters before LinkedIn's mobile *"…see more"* cutoff.
- **Paragraph Spacing:** Flags any block with more than 4 consecutive lines to preserve mobile scannability.
- **AI Jargon Filter:** Rejects corporate buzzwords (*"game-changer"*, *"thrilled to announce"*, *"paradigm shift"*, *"delve"*).

---

## 6. How to Run the Platform

### Step 1: Open the Project Directory
Set your active workspace to:
```bash
cd "C:\Users\seuna\.gemini\antigravity\scratch\linkedin-brand-platform"
```

### Step 2: Run Automated Test Suite
To verify database schemas, agents, QC rules, approval gates, and publisher guards:
```bash
npm test
```

### Step 3: Start the Backend & Frontend
To run both the Express API and Vite React client simultaneously:
```bash
npm run dev
```
- **Backend API:** `http://localhost:3001`
- **Frontend Dashboard:** `http://localhost:5173`

---

## 7. Weekly Operating Routine (WAT)

- **Sunday 6:00 PM WAT:** The Content Engine automatically discovers research topics, runs fact-checking audits, scaffolds any required project demonstrations, and generates the Monday–Friday 5-post calendar. A mobile push notification alerts you that your queue is ready.
- **Monday 8:00 AM WAT:** Mobile reminder notifies you to review and approve the week's posts in the **Approval Center**. With 1 tap per post, you can approve, edit, or reject.
- **Monday–Friday (08:15–08:45 AM WAT):** Approved posts publish automatically to LinkedIn at peak West Africa networking hours with generated infographics and first comments.
- **Wednesday 8:00 AM WAT:** Midweek check-in notification reports on early engagement and flags any pending posts for Thursday and Friday.
- **Friday 4:00 PM WAT:** Weekly Performance Review compiles impressions, reactions, inbound leads, and generates the weekly report.
