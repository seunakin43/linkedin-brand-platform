import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.join(__dirname, '../../public/media');
const DIST_MEDIA_DIR = path.join(__dirname, '../../dist/media');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class DynamicCarouselGenerator {
  /**
   * Generates a 5-slide technical LinkedIn carousel for a post.
   * Returns an array of relative image URLs: ['/media/carousel_..._slide_1.svg', ...]
   */
  static generateCarousel({
    postId,
    title,
    hook = '',
    content = '',
    pillarSlug = 'ai-automation',
    pillarName = 'AI Automation',
    contentFormat = 'Architecture',
    hashtags = '',
    audienceQuestion = ''
  }) {
    if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
    if (!fs.existsSync(DIST_MEDIA_DIR)) fs.mkdirSync(DIST_MEDIA_DIR, { recursive: true });

    const safeSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25);

    // Color palettes & styling specific to each pillar
    const themes = {
      'telecom-noc': {
        accent: '#38BDF8', // Cyan
        border: '#0284C7',
        badgeBg: '#0C4A6E',
        badgeText: '#38BDF8',
        glow: '#0369A1',
        cardBg: '#08152B',
        bgGrad: ['#040914', '#081730', '#020617'],
        label: 'TELECOMMUNICATIONS &amp; NOC OPERATIONS',
        iconType: 'TOWER'
      },
      'ai-automation': {
        accent: '#C084FC', // Purple/Violet
        border: '#7E22CE',
        badgeBg: '#3B0764',
        badgeText: '#E9D5FF',
        glow: '#6B21A8',
        cardBg: '#150A2A',
        bgGrad: ['#090514', '#1A0C38', '#05020D'],
        label: 'DETERMINISTIC AI AGENTS &amp; WORKFLOWS',
        iconType: 'GUARDRAIL'
      },
      'projects-demos': {
        accent: '#34D399', // Mint / Emerald
        border: '#059669',
        badgeBg: '#064E3B',
        badgeText: '#A7F3D0',
        glow: '#047857',
        cardBg: '#06241B',
        bgGrad: ['#03140E', '#0B2F23', '#020B08'],
        label: 'PROJECT DEMONSTRATION &amp; PLATFORM',
        iconType: 'PLATFORM'
      },
      'industry-insights': {
        accent: '#F59E0B', // Amber
        border: '#D97706',
        badgeBg: '#451A03',
        badgeText: '#FDE68A',
        glow: '#B45309',
        cardBg: '#211304',
        bgGrad: ['#120A02', '#291805', '#0A0501'],
        label: 'TELECOM EDGE AI &amp; OBSERVABILITY',
        iconType: 'TELEMETRY'
      },
      'thought-leadership': {
        accent: '#818CF8', // Indigo
        border: '#4F46E5',
        badgeBg: '#1E1B4B',
        badgeText: '#C7D2FE',
        glow: '#3730A3',
        cardBg: '#11133D',
        bgGrad: ['#07081A', '#16194F', '#040510'],
        label: 'T-SHAPED AI GENERALIST STRATEGY',
        iconType: 'STRATEGY'
      },
      'professional-dev': {
        accent: '#F472B6', // Rose
        border: '#DB2777',
        badgeBg: '#500724',
        badgeText: '#FBCFE8',
        glow: '#9D174D',
        cardBg: '#270816',
        bgGrad: ['#14030B', '#2E0A1B', '#0A0206'],
        label: 'APPLIED ENGINEERING &amp; MASTERY',
        iconType: 'SKILLS'
      }
    };

    const theme = themes[pillarSlug] || themes['ai-automation'];

    // Split title into 2-3 lines
    const titleWords = title.split(' ');
    const titleLines = [];
    let currentLine = '';
    for (const w of titleWords) {
      if ((currentLine + ' ' + w).trim().length > 26 && currentLine) {
        titleLines.push(currentLine.trim());
        currentLine = w;
      } else {
        currentLine = (currentLine + ' ' + w).trim();
      }
    }
    if (currentLine) titleLines.push(currentLine.trim());
    const displayTitleLines = titleLines.slice(0, 3);

    // Extract key bullet points from content
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
    const bulletPoints = paragraphs
      .filter(p => /^[0-9]\.|\*|-/.test(p.trim()))
      .map(p => p.trim().replace(/^[0-9]\.\s*|\*\s*|-\s*/, ''))
      .slice(0, 3);

    const slideUrls = [];
    const totalSlides = 5;

    for (let slideNum = 1; slideNum <= totalSlides; slideNum++) {
      const filename = `carousel_${postId}_slide_${slideNum}.svg`;
      const filePath = path.join(MEDIA_DIR, filename);
      const distFilePath = path.join(DIST_MEDIA_DIR, filename);

      let slideContentSvg = '';

      if (slideNum === 1) {
        // SLIDE 1: COVER / HOOK
        slideContentSvg = `
          <!-- Category Badge -->
          <rect x="80" y="75" width="460" height="42" rx="21" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="1.5" />
          <text x="310" y="102" fill="${theme.badgeText}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="800" letter-spacing="1.2" text-anchor="middle">${theme.label}</text>

          <!-- Main Title -->
          <text x="80" y="200" fill="#FFFFFF" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="46" font-weight="800">
            ${displayTitleLines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 58}">${escapeXml(l)}</tspan>`).join('')}
          </text>

          <!-- Hook Card -->
          <rect x="80" y="440" width="920" height="320" rx="24" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="2" />
          <text x="120" y="500" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">THE ENGINEERING REALITY</text>
          
          <text x="120" y="555" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="600" width="840">
            <tspan x="120" dy="0">${escapeXml(hook.slice(0, 60))}</tspan>
            <tspan x="120" dy="36">${escapeXml(hook.slice(60, 125))}</tspan>
            <tspan x="120" dy="36">${escapeXml(hook.slice(125, 190))}...</tspan>
          </text>

          <g transform="translate(120, 670)">
            <rect x="0" y="0" width="260" height="48" rx="24" fill="${theme.badgeBg}" stroke="${theme.accent}" />
            <text x="130" y="30" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle">789+ NOC NODES</text>

            <rect x="280" y="0" width="260" height="48" rx="24" fill="${theme.badgeBg}" stroke="${theme.accent}" />
            <text x="410" y="30" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800" text-anchor="middle">99.8% SLA DISCIPLINE</text>
          </g>

          <!-- Swipe Indicator -->
          <g transform="translate(80, 810)">
            <rect x="0" y="0" width="920" height="70" rx="18" fill="#0F172A" stroke="#334155" />
            <text x="40" y="42" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">SWIPE THROUGH THE 5-SLIDE BREAKDOWN</text>
            <text x="880" y="42" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 1 OF 5 ➔</text>
          </g>
        `;
      } else if (slideNum === 2) {
        // SLIDE 2: THE PROBLEM / THE CHALLENGE
        slideContentSvg = `
          <!-- Slide Pill -->
          <rect x="80" y="75" width="280" height="42" rx="21" fill="#450A0A" stroke="#DC2626" stroke-width="1.5" />
          <text x="220" y="102" fill="#FCA5A5" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" text-anchor="middle">01 · THE PROBLEM</text>

          <text x="80" y="180" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="42" font-weight="800">
            Why Traditional Approaches Fail Under Load
          </text>
          <text x="80" y="235" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="20">
            Real operations break when systems rely on manual intervention or unconstrained outputs.
          </text>

          <!-- Failure Vectors Box -->
          <rect x="80" y="280" width="920" height="520" rx="24" fill="#180B0B" stroke="#7F1D1D" stroke-width="2" />
          
          <g transform="translate(130, 340)">
            <rect x="0" y="0" width="820" height="110" rx="16" fill="#2A1212" stroke="#991B1B" />
            <text x="35" y="45" fill="#EF4444" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800">Vector A: Alert Fatigue &amp; Cascade Storms</text>
            <text x="35" y="80" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Hundreds of uncoordinated alarms flood on-call engineers, obscuring the single true root cause.</text>

            <rect x="0" y="140" width="820" height="110" rx="16" fill="#2A1212" stroke="#991B1B" />
            <text x="35" y="185" fill="#EF4444" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800">Vector B: Non-Deterministic LLM Payloads</text>
            <text x="35" y="220" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Free-form AI outputs create silent schema corruptions when dumped directly into production databases.</text>

            <rect x="0" y="280" width="820" height="110" rx="16" fill="#2A1212" stroke="#991B1B" />
            <text x="35" y="325" fill="#EF4444" font-family="'JetBrains Mono', monospace" font-size="20" font-weight="800">Vector C: Reactive Late-Night Firefighting</text>
            <text x="35" y="360" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Engineers dispatched after the DC battery has already dropped below 42V, breaching strict SLA windows.</text>
          </g>

          <g transform="translate(80, 830)">
            <rect x="0" y="0" width="920" height="60" rx="16" fill="#0F172A" stroke="#334155" />
            <text x="40" y="37" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600">NEXT: THE DETERMINISTIC ARCHITECTURE</text>
            <text x="880" y="37" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 2 OF 5 ➔</text>
          </g>
        `;
      } else if (slideNum === 3) {
        // SLIDE 3: THE SOLUTION ARCHITECTURE
        slideContentSvg = `
          <!-- Slide Pill -->
          <rect x="80" y="75" width="310" height="42" rx="21" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="1.5" />
          <text x="235" y="102" fill="${theme.badgeText}" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" text-anchor="middle">02 · THE ARCHITECTURE</text>

          <text x="80" y="180" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="42" font-weight="800">
            The 3-Step Deterministic Framework
          </text>
          <text x="80" y="235" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="20">
            How we eliminate failure modes with automated ingestion, guardrails, and telemetry.
          </text>

          <!-- Architecture Flow Box -->
          <rect x="80" y="280" width="920" height="520" rx="24" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="2" />
          
          <g transform="translate(130, 330)">
            <!-- Step 1 -->
            <rect x="0" y="0" width="240" height="180" rx="16" fill="#0F172A" stroke="${theme.border}" stroke-width="2" />
            <text x="25" y="45" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800">01. INGESTION</text>
            <text x="25" y="85" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">IoT &amp; Webhooks</text>
            <text x="25" y="120" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Galooli RMS telemetry / HTTP raw payloads</text>
            <text x="25" y="155" fill="#38BDF8" font-family="'JetBrains Mono', monospace" font-size="12">&lt; 48V DC Tracking</text>

            <path d="M 255 90 L 285 90" stroke="${theme.accent}" stroke-width="3" />

            <!-- Step 2 -->
            <rect x="300" y="0" width="240" height="180" rx="16" fill="#0F172A" stroke="${theme.accent}" stroke-width="2" />
            <text x="25" y="45" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800">02. GUARDRAIL</text>
            <text x="25" y="85" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">Strict Schema</text>
            <text x="25" y="120" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">JSON validation &amp; circuit breaker fallback</text>
            <text x="25" y="155" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="12">Zero Silent Errors</text>

            <path d="M 555 90 L 585 90" stroke="${theme.accent}" stroke-width="3" />

            <!-- Step 3 -->
            <rect x="600" y="0" width="240" height="180" rx="16" fill="#0F172A" stroke="#10B981" stroke-width="2" />
            <text x="25" y="45" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800">03. EXECUTION</text>
            <text x="25" y="85" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">Targeted Action</text>
            <text x="25" y="120" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Automated field dispatch &amp; database commit</text>
            <text x="25" y="155" fill="#F59E0B" font-family="'JetBrains Mono', monospace" font-size="12">SLA 99.8% Uptime</text>
          </g>

          <g transform="translate(130, 560)">
            <rect x="0" y="0" width="840" height="190" rx="16" fill="#0B132B" stroke="#1E293B" />
            <text x="35" y="45" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800">PIPELINE CHARACTERISTICS</text>
            <text x="35" y="85" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">✔ Deterministic Execution: Model intelligence bounded by strict typed interfaces.</text>
            <text x="35" y="120" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">✔ Human-in-the-Loop (HITL): Critical mutations require one-click human authorization.</text>
            <text x="35" y="155" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">✔ Complete Auditability: Every state transition recorded in Supabase / PostgreSQL.</text>
          </g>

          <g transform="translate(80, 830)">
            <rect x="0" y="0" width="920" height="60" rx="16" fill="#0F172A" stroke="#334155" />
            <text x="40" y="37" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600">NEXT: PROVEN METRICS &amp; PRODUCTION NUMBERS</text>
            <text x="880" y="37" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 3 OF 5 ➔</text>
          </g>
        `;
      } else if (slideNum === 4) {
        // SLIDE 4: PROVEN METRICS & OPERATIONAL IMPACT
        slideContentSvg = `
          <!-- Slide Pill -->
          <rect x="80" y="75" width="290" height="42" rx="21" fill="#064E3B" stroke="#10B981" stroke-width="1.5" />
          <text x="225" y="102" fill="#6EE7B7" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" text-anchor="middle">03 · PROVEN RESULTS</text>

          <text x="80" y="180" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="42" font-weight="800">
            Real Metrics from Mission-Critical Operations
          </text>
          <text x="80" y="235" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="20">
            Verified numbers from 24/7 telecommunications surveillance and applied AI systems.
          </text>

          <!-- Twin Stats Cards -->
          <g transform="translate(80, 280)">
            <!-- Card 1 -->
            <rect x="0" y="0" width="440" height="300" rx="24" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="2" />
            <text x="40" y="65" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">NETWORK SCALE &amp; RELIABILITY</text>
            <text x="40" y="150" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="64" font-weight="900">789+</text>
            <text x="40" y="195" fill="#38BDF8" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="800">Cellular Nodes Monitored</text>
            <text x="40" y="240" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Pan African Towers 24/7 nationwide network surveillance with 99.8% SLA compliance.</text>

            <!-- Card 2 -->
            <rect x="480" y="0" width="440" height="300" rx="24" fill="${theme.cardBg}" stroke="#10B981" stroke-width="2" />
            <text x="520" y="65" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">MTTR ACCELERATION</text>
            <text x="520" y="150" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="64" font-weight="900">-30%</text>
            <text x="520" y="195" fill="#A7F3D0" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="800">Mean Time to Repair</text>
            <text x="520" y="240" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Achieved via standardized failure signatures and automated root-cause alarm triage.</text>
          </g>

          <!-- Third Card -->
          <g transform="translate(80, 610)">
            <rect x="0" y="0" width="920" height="190" rx="20" fill="#0F172A" stroke="#1E293B" />
            <text x="40" y="50" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800">THE TAKEAWAY FOR ENGINEERING TEAMS</text>
            <text x="40" y="95" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="500">
              Uptime is never an accident of luck or heroic late-night fixing.
            </text>
            <text x="40" y="130" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="500">
              It is the inevitable output of deterministic systems designed to handle failure states before they trigger outages.
            </text>
          </g>

          <g transform="translate(80, 830)">
            <rect x="0" y="0" width="920" height="60" rx="16" fill="#0F172A" stroke="#334155" />
            <text x="40" y="37" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600">NEXT: KEY TAKEAWAYS &amp; DISCUSSION</text>
            <text x="880" y="37" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 4 OF 5 ➔</text>
          </g>
        `;
      } else {
        // SLIDE 5: TAKEAWAY & DISCUSSION
        slideContentSvg = `
          <!-- Slide Pill -->
          <rect x="80" y="75" width="310" height="42" rx="21" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="1.5" />
          <text x="235" y="102" fill="${theme.badgeText}" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" text-anchor="middle">04 · TAKEAWAY &amp; CTA</text>

          <text x="80" y="180" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="42" font-weight="800">
            Operational Rigor &gt; Tool Hype
          </text>
          <text x="80" y="235" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="20">
            Build your foundation on real operational boundaries, and intelligence will follow safely.
          </text>

          <!-- Discussion Question Card -->
          <rect x="80" y="280" width="920" height="260" rx="24" fill="${theme.cardBg}" stroke="${theme.accent}" stroke-width="2" />
          <text x="120" y="335" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">QUESTION FOR ENGINEERS &amp; SREs</text>
          
          <text x="120" y="390" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="700">
            <tspan x="120" dy="0">${escapeXml((audienceQuestion || 'What is the biggest operational bottleneck your engineering team is actively trying to eliminate?').slice(0, 55))}</tspan>
            <tspan x="120" dy="38">${escapeXml((audienceQuestion || 'What is the biggest operational bottleneck your engineering team is actively trying to eliminate?').slice(55, 120))}</tspan>
          </text>

          <text x="120" y="490" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">
            Drop your perspective in the comments below · Join the engineering discussion
          </text>

          <!-- Author Connection Card -->
          <g transform="translate(80, 570)">
            <rect x="0" y="0" width="920" height="230" rx="24" fill="#0F172A" stroke="#1E293B" stroke-width="1.5" />
            
            <circle cx="80" cy="80" r="45" fill="${theme.badgeBg}" stroke="${theme.accent}" stroke-width="2" />
            <text x="80" y="90" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="800" text-anchor="middle">TA</text>

            <text x="155" y="65" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800">Toluwanimi Akinyemi</text>
            <text x="155" y="95" fill="#38BDF8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">Telecommunications NOC Engineer &amp; AI Automation Engineer</text>
            <text x="155" y="125" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Pan African Towers 789+ Nodes · UNIOSUN PGD Financial Math · ExpenseIQ Lead</text>

            <line x1="40" y1="155" x2="880" y2="155" stroke="#1E293B" stroke-width="1" />

            <text x="40" y="195" fill="#64748B" font-family="'JetBrains Mono', monospace" font-size="14">LinkedIn: /in/akinyemi-toluwanimi</text>
            <text x="880" y="195" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="700" text-anchor="end">FOLLOW FOR DAILY SYSTEM ARCHITECTURE</text>
          </g>

          <g transform="translate(80, 830)">
            <rect x="0" y="0" width="920" height="60" rx="16" fill="#064E3B" stroke="#059669" />
            <text x="40" y="37" fill="#A7F3D0" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="700">✔ 5-SLIDE CAROUSEL COMPLETE</text>
            <text x="880" y="37" fill="#6EE7B7" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 5 OF 5</text>
          </g>
        `;
      }

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bg_${postId}_s${slideNum}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgGrad[0]}" />
      <stop offset="50%" stop-color="${theme.bgGrad[1]}" />
      <stop offset="100%" stop-color="${theme.bgGrad[2]}" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bg_${postId}_s${slideNum})" />

  <!-- Slide Body Content -->
  ${slideContentSvg}

  <!-- Footer Branding -->
  <line x1="80" y1="960" x2="1000" y2="960" stroke="#1E293B" stroke-width="1" />
  <text x="80" y="1005" fill="#64748B" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">
    Toluwanimi Akinyemi · Telecommunications NOC &amp; AI Automation Engineer
  </text>
  <text x="1000" y="1005" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="700" text-anchor="end">
    SLIDE ${slideNum} / ${totalSlides} · 789 NODES · 99.8% SLA
  </text>
</svg>`.trim();

      fs.writeFileSync(filePath, svgContent, 'utf-8');
      fs.writeFileSync(distFilePath, svgContent, 'utf-8');
      slideUrls.push(`/media/${filename}`);
    }

    return slideUrls;
  }
}
