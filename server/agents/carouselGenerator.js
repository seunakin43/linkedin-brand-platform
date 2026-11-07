import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

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

function wrapText(text, maxCharsPerLine = 28, maxLines = 3) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = w;
      if (lines.length === maxLines - 1) break;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current && lines.length < maxLines) lines.push(current.trim());
  return lines;
}

/**
 * Extracts 3 numbered steps from the post text if available:
 * e.g. "1. Telemetry Ingress...", "2. Automated Threshold...", "3. Predictive..."
 */
function extractNumberedSteps(content) {
  if (!content) return null;
  const stepRegex = /(?:^|\n)\s*([0-9])[\.\)]\s*([^\n\r]+)([\s\S]*?)(?=(?:\n\s*[0-9][\.\)])|$)/g;
  const steps = [];
  let match;
  while ((match = stepRegex.exec(content)) !== null) {
    const num = match[1];
    const rawTitle = match[2].trim().replace(/\.$/, '');
    const bodyText = (match[3] || '').trim().replace(/\n+/g, ' ');
    
    // Split title and subtitle if period or colon present
    const colonIdx = rawTitle.indexOf(':');
    let title = rawTitle;
    let subtitle = bodyText ? bodyText.slice(0, 50) + (bodyText.length > 50 ? '...' : '') : 'Automated protocol';
    if (colonIdx > 0 && colonIdx < 30) {
      title = rawTitle.slice(0, colonIdx).trim();
      subtitle = (rawTitle.slice(colonIdx + 1).trim() + ' ' + bodyText).slice(0, 50) + '...';
    }

    steps.push({
      number: num,
      title: title.slice(0, 24),
      description: subtitle.slice(0, 55)
    });
    if (steps.length === 3) break;
  }
  return steps.length === 3 ? steps : null;
}

/**
 * Derives 3 failure vectors tailored to the post's domain and topic.
 */
function deriveFailureVectors(title, content, pillarSlug) {
  const text = (title + ' ' + content).toLowerCase();

  if (text.includes('expense') || text.includes('audit') || text.includes('receipt') || text.includes('invoice')) {
    return [
      {
        tag: 'Vector A: Manual 18-Min Audit Bottlenecks',
        desc: 'Finance teams review line items manually, causing invoice backlog and human error.'
      },
      {
        tag: 'Vector B: Multi-Tenant Schema Collisions',
        desc: 'Different vendor formats break unvalidated parsers and create database reconciliation errors.'
      },
      {
        tag: 'Vector C: Hallucinated Tax & Currency Math',
        desc: 'LLMs guessing total amounts without strict schema validation create compliance liabilities.'
      }
    ];
  }

  if (text.includes('battery') || text.includes('48v') || text.includes('rms') || text.includes('telemetry') || text.includes('rectifier')) {
    return [
      {
        tag: 'Vector A: Delayed Nocturnal Battery Warning',
        desc: 'Technicians alerted only after DC bus drops below 42V—when cellular cells have already died.'
      },
      {
        tag: 'Vector B: Spurious Starter Motor Voltage Sags',
        desc: 'Transient generator crank dips trigger false alarms, creating severe alert fatigue.'
      },
      {
        tag: 'Vector C: Blind Field Technician Dispatch',
        desc: 'Field teams dispatched without cell coordinates, battery temperature data, or spare parts.'
      }
    ];
  }

  if (text.includes('schema') || text.includes('json') || text.includes('guardrail') || text.includes('deterministic')) {
    return [
      {
        tag: 'Vector A: Free-Form LLM Text Ingestion',
        desc: 'Allowing unvalidated natural language outputs directly into production databases.'
      },
      {
        tag: 'Vector B: Silent Type Corruptions & Null Values',
        desc: 'Unexpected schema deviations crash downstream microservices and external webhooks.'
      },
      {
        tag: 'Vector C: Missing Automated Fallback Breakers',
        desc: 'Pipelines failing completely instead of routing invalid payloads into retry queues.'
      }
    ];
  }

  if (text.includes('alarm') || text.includes('fatigue') || text.includes('cascade') || text.includes('outage') || text.includes('mttr')) {
    return [
      {
        tag: 'Vector A: Alert Storms & Cascade Floods',
        desc: 'Hundreds of uncoordinated alarms flood on-call engineers, obscuring the single true root cause.'
      },
      {
        tag: 'Vector B: Solving the Same Outage Twice',
        desc: 'Uncodified failure signatures force successive shifts to debug recurring issues from scratch.'
      },
      {
        tag: 'Vector C: Fragmented Topology Visibility',
        desc: 'Power and transmission dependencies unmapped, leading to misdirected technician dispatches.'
      }
    ];
  }

  // Generalist / AI Systems Fallback
  return [
    {
      tag: 'Vector A: Fragile Toy Script Automations',
      desc: 'Workflows built from generic tutorials breaking on first network latency or rate limit.'
    },
    {
      tag: 'Vector B: Superficial Tool Hopping',
      desc: 'Adopting frameworks without understanding underlying domain constraints or data shapes.'
    },
    {
      tag: 'Vector C: Lack of SLA Discipline',
      desc: 'Treating high-stakes production environments with low-stakes weekend project rigor.'
    }
  ];
}

/**
 * Derives verified domain metrics for Slide 4 based on topic and pillar.
 */
function deriveMetrics(title, content, pillarSlug) {
  const text = (title + ' ' + content).toLowerCase();

  if (text.includes('expense') || text.includes('audit')) {
    return {
      metric1: '10 SEC',
      label1: 'Audit Cycle Time',
      sub1: 'Reduced from 18-minute manual reviews to sub-10-second automated audits.',
      metric2: '100%',
      label2: 'Schema Compliance',
      sub2: 'Multi-tenant isolation and verified OCR matching before database state commit.',
      takeaway: 'Financial automation is not about replacing judgment—it is eliminating repetitive verification so human reviewers only handle real anomalies.'
    };
  }

  if (text.includes('battery') || text.includes('48v') || text.includes('telecom') || text.includes('noc')) {
    return {
      metric1: '789+',
      label1: 'Cellular Nodes Monitored',
      sub1: 'Pan African Towers 24/7 nationwide network surveillance with 99.8% SLA compliance.',
      metric2: '-30%',
      label2: 'MTTR Acceleration',
      sub2: 'Achieved via standardized failure signatures and automated root-cause alarm triage.',
      takeaway: 'Uptime is never an accident of luck or heroic late-night fixing. It is the inevitable output of deterministic systems built to prevent failure states.'
    };
  }

  if (text.includes('schema') || text.includes('guardrail') || text.includes('agent')) {
    return {
      metric1: '100%',
      label1: 'Type-Safe Validation',
      sub1: 'Every LLM output bounded by strict JSON Schemas before any state mutation.',
      metric2: '0',
      label2: 'Silent Failure Tolerance',
      sub2: 'Deterministic circuit breakers route deviations into auditable recovery queues.',
      takeaway: 'Intelligence without guardrails is a liability. Enforce the boundaries first, and the model will execute reliably.'
    };
  }

  // T-shaped / default
  return {
    metric1: '789+',
    label1: 'Battle-Tested Nodes',
    sub1: 'Years of mission-critical NOC operational depth meeting modern AI cloud agility.',
    metric2: '99.8%',
    label2: 'SLA Availability',
    sub2: 'Operational rigor applied to n8n, Make.com, Gemini API, and full-stack architectures.',
    takeaway: 'Tools change every six months. The ability to diagnose complex operational breakdowns and architect reliable systems is an enduring superpower.'
  };
}

export class DynamicCarouselGenerator {
  /**
   * Generates a 5-slide technical LinkedIn carousel for a post.
   * Creates BOTH high-res PNG and vector SVG for each slide.
   * Returns array of relative image URLs: ['/media/carousel_..._slide_1.svg', ...]
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

    // Pillar design themes & color palettes
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
        badge1: '789+ NOC NODES',
        badge2: '99.8% SLA DISCIPLINE'
      },
      'ai-automation': {
        accent: '#C084FC', // Violet
        border: '#7E22CE',
        badgeBg: '#3B0764',
        badgeText: '#E9D5FF',
        glow: '#6B21A8',
        cardBg: '#150A2A',
        bgGrad: ['#090514', '#1A0C38', '#05020D'],
        label: 'DETERMINISTIC AI AGENTS &amp; WORKFLOWS',
        badge1: 'STRICT JSON SCHEMAS',
        badge2: 'ZERO SILENT FAILURES'
      },
      'projects-demos': {
        accent: '#34D399', // Mint / Emerald
        border: '#059669',
        badgeBg: '#064E3B',
        badgeText: '#A7F3D0',
        glow: '#047857',
        cardBg: '#06241B',
        bgGrad: ['#03140E', '#0B2F23', '#020B08'],
        label: 'EXPENSEIQ &amp; SYSTEM PROTOTYPES',
        badge1: '18 MIN ➔ 10 SEC',
        badge2: 'MULTI-TENANT AUDITS'
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
        badge1: 'GALOOLI RMS IoT',
        badge2: 'VOLTAGE PREDICTION'
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
        badge1: 'DOMAIN DEPTH FIRST',
        badge2: 'PRACTICAL AUTOMATION'
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
        badge1: 'PGD FINANCIAL MATH',
        badge2: 'STATISTICAL RIGOR'
      }
    };

    const theme = themes[pillarSlug] || themes['ai-automation'];

    // Wrap Title dynamically into 2-3 lines
    const titleLines = wrapText(title, 26, 3);

    // Dynamic Failure Vectors for Slide 2
    const failureVectors = deriveFailureVectors(title, content, pillarSlug);

    // Dynamic 3 Steps for Slide 3
    const parsedSteps = extractNumberedSteps(content);
    const steps = parsedSteps || [
      { number: '1', title: 'Data Ingress & Mapping', description: 'Real-time telemetry / structured payload capture' },
      { number: '2', title: 'Guardrail Validation', description: 'Strict typed schema verification & circuit breakers' },
      { number: '3', title: 'Deterministic Action', description: 'Automated field dispatch & audit log commit' }
    ];

    // Dynamic Metrics for Slide 4
    const metrics = deriveMetrics(title, content, pillarSlug);

    // Discussion Question for Slide 5
    const cleanQuestion = audienceQuestion || 'What is the biggest operational bottleneck your engineering team is actively trying to eliminate?';

    const slideUrls = [];
    const totalSlides = 5;

    for (let slideNum = 1; slideNum <= totalSlides; slideNum++) {
      const baseFilename = `carousel_${postId}_slide_${slideNum}`;
      const svgFilename = `${baseFilename}.svg`;
      const pngFilename = `${baseFilename}.png`;

      const svgPath = path.join(MEDIA_DIR, svgFilename);
      const distSvgPath = path.join(DIST_MEDIA_DIR, svgFilename);

      const pngPath = path.join(MEDIA_DIR, pngFilename);
      const distPngPath = path.join(DIST_MEDIA_DIR, pngFilename);

      let slideContentSvg = '';

      if (slideNum === 1) {
        // SLIDE 1: COVER / HOOK
        slideContentSvg = `
          <!-- Category Badge -->
          <rect x="80" y="75" width="460" height="42" rx="21" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="1.5" />
          <text x="310" y="102" fill="${theme.badgeText}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="13" font-weight="800" letter-spacing="1.2" text-anchor="middle">${theme.label}</text>

          <!-- Main Title -->
          <text x="80" y="200" fill="#FFFFFF" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="44" font-weight="800">
            ${titleLines.map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 56}">${escapeXml(l)}</tspan>`).join('')}
          </text>

          <!-- Hook Card -->
          <rect x="80" y="440" width="920" height="320" rx="24" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="2" />
          <text x="120" y="500" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">THE ENGINEERING REALITY</text>
          
          <text x="120" y="555" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="600">
            <tspan x="120" dy="0">${escapeXml(hook.slice(0, 60))}</tspan>
            <tspan x="120" dy="36">${escapeXml(hook.slice(60, 125))}</tspan>
            <tspan x="120" dy="36">${escapeXml(hook.slice(125, 195))}...</tspan>
          </text>

          <g transform="translate(120, 670)">
            <rect x="0" y="0" width="280" height="48" rx="24" fill="${theme.badgeBg}" stroke="${theme.accent}" />
            <text x="140" y="30" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="middle">${escapeXml(theme.badge1)}</text>

            <rect x="300" y="0" width="280" height="48" rx="24" fill="${theme.badgeBg}" stroke="${theme.accent}" />
            <text x="440" y="30" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="800" text-anchor="middle">${escapeXml(theme.badge2)}</text>
          </g>

          <!-- Swipe Indicator -->
          <g transform="translate(80, 810)">
            <rect x="0" y="0" width="920" height="70" rx="18" fill="#0F172A" stroke="#334155" />
            <text x="40" y="42" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">SWIPE THROUGH THE 5-SLIDE BREAKDOWN</text>
            <text x="880" y="42" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 1 OF 5 ➔</text>
          </g>
        `;
      } else if (slideNum === 2) {
        // SLIDE 2: THE PROBLEM / THE FAILURE VECTORS (Dynamically customized per post)
        slideContentSvg = `
          <!-- Slide Pill -->
          <rect x="80" y="75" width="280" height="42" rx="21" fill="#450A0A" stroke="#DC2626" stroke-width="1.5" />
          <text x="220" y="102" fill="#FCA5A5" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" text-anchor="middle">01 · THE PROBLEM</text>

          <text x="80" y="175" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="38" font-weight="800">
            Why Systems Break Without Structured Safeguards
          </text>
          <text x="80" y="225" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
            Operational bottlenecks arise when engineering teams rely on manual intervention or unconstrained outputs.
          </text>

          <!-- Failure Vectors Box -->
          <rect x="80" y="270" width="920" height="530" rx="24" fill="#180B0B" stroke="#7F1D1D" stroke-width="2" />
          
          <g transform="translate(130, 315)">
            <rect x="0" y="0" width="820" height="125" rx="16" fill="#2A1212" stroke="#991B1B" />
            <text x="35" y="45" fill="#EF4444" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800">${escapeXml(failureVectors[0].tag)}</text>
            <text x="35" y="80" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">${escapeXml(failureVectors[0].desc)}</text>

            <rect x="0" y="150" width="820" height="125" rx="16" fill="#2A1212" stroke="#991B1B" />
            <text x="35" y="195" fill="#EF4444" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800">${escapeXml(failureVectors[1].tag)}</text>
            <text x="35" y="230" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">${escapeXml(failureVectors[1].desc)}</text>

            <rect x="0" y="300" width="820" height="125" rx="16" fill="#2A1212" stroke="#991B1B" />
            <text x="35" y="345" fill="#EF4444" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800">${escapeXml(failureVectors[2].tag)}</text>
            <text x="35" y="380" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">${escapeXml(failureVectors[2].desc)}</text>
          </g>

          <g transform="translate(80, 830)">
            <rect x="0" y="0" width="920" height="60" rx="16" fill="#0F172A" stroke="#334155" />
            <text x="40" y="37" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600">NEXT: THE 3-STEP ARCHITECTURE</text>
            <text x="880" y="37" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 2 OF 5 ➔</text>
          </g>
        `;
      } else if (slideNum === 3) {
        // SLIDE 3: THE SOLUTION ARCHITECTURE (Parsed directly from post content)
        slideContentSvg = `
          <!-- Slide Pill -->
          <rect x="80" y="75" width="310" height="42" rx="21" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="1.5" />
          <text x="235" y="102" fill="${theme.badgeText}" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" text-anchor="middle">02 · THE ARCHITECTURE</text>

          <text x="80" y="175" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="38" font-weight="800">
            The 3-Step Production Protocol
          </text>
          <text x="80" y="225" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
            How we eliminate edge failure cases with deterministic validation, telemetry, and execution.
          </text>

          <!-- Architecture Flow Box -->
          <rect x="80" y="270" width="920" height="530" rx="24" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="2" />
          
          <g transform="translate(130, 310)">
            <!-- Step 1 -->
            <rect x="0" y="0" width="245" height="195" rx="16" fill="#0F172A" stroke="${theme.border}" stroke-width="2" />
            <text x="20" y="40" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800">STEP 01</text>
            <text x="20" y="80" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="700">${escapeXml(steps[0].title)}</text>
            <text x="20" y="115" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="13">
              <tspan x="20" dy="0">${escapeXml(steps[0].description.slice(0, 30))}</tspan>
              <tspan x="20" dy="20">${escapeXml(steps[0].description.slice(30, 60))}</tspan>
            </text>
            <text x="20" y="170" fill="#38BDF8" font-family="'JetBrains Mono', monospace" font-size="12">Verified Ingress</text>

            <path d="M 260 95 L 285 95" stroke="${theme.accent}" stroke-width="3" />

            <!-- Step 2 -->
            <rect x="295" y="0" width="245" height="195" rx="16" fill="#0F172A" stroke="${theme.accent}" stroke-width="2" />
            <text x="20" y="40" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800">STEP 02</text>
            <text x="20" y="80" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="700">${escapeXml(steps[1].title)}</text>
            <text x="20" y="115" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="13">
              <tspan x="20" dy="0">${escapeXml(steps[1].description.slice(0, 30))}</tspan>
              <tspan x="20" dy="20">${escapeXml(steps[1].description.slice(30, 60))}</tspan>
            </text>
            <text x="20" y="170" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="12">Guardrail Enforced</text>

            <path d="M 555 95 L 580 95" stroke="${theme.accent}" stroke-width="3" />

            <!-- Step 3 -->
            <rect x="590" y="0" width="245" height="195" rx="16" fill="#0F172A" stroke="#10B981" stroke-width="2" />
            <text x="20" y="40" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="800">STEP 03</text>
            <text x="20" y="80" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="700">${escapeXml(steps[2].title)}</text>
            <text x="20" y="115" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="13">
              <tspan x="20" dy="0">${escapeXml(steps[2].description.slice(0, 30))}</tspan>
              <tspan x="20" dy="20">${escapeXml(steps[2].description.slice(30, 60))}</tspan>
            </text>
            <text x="20" y="170" fill="#F59E0B" font-family="'JetBrains Mono', monospace" font-size="12">Targeted Action</text>
          </g>

          <g transform="translate(130, 530)">
            <rect x="0" y="0" width="835" height="230" rx="16" fill="#0B132B" stroke="#1E293B" />
            <text x="35" y="45" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800">PIPELINE CHARACTERISTICS</text>
            <text x="35" y="90" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">✔ Deterministic Execution: Model intelligence bounded by strict typed interfaces.</text>
            <text x="35" y="130" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">✔ Human-in-the-Loop (HITL): Critical mutations require explicit one-click authorization.</text>
            <text x="35" y="170" fill="#E2E8F0" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">✔ Complete Auditability: Every state transition recorded in PostgreSQL / Supabase.</text>
            <text x="35" y="205" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Built &amp; monitored by Toluwanimi Taiwo Akinyemi (Pan African Towers NOC Lead)</text>
          </g>

          <g transform="translate(80, 830)">
            <rect x="0" y="0" width="920" height="60" rx="16" fill="#0F172A" stroke="#334155" />
            <text x="40" y="37" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600">NEXT: PROVEN METRICS &amp; PRODUCTION IMPACT</text>
            <text x="880" y="37" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" text-anchor="end">SLIDE 3 OF 5 ➔</text>
          </g>
        `;
      } else if (slideNum === 4) {
        // SLIDE 4: PROVEN METRICS & OPERATIONAL IMPACT (Domain-matched)
        slideContentSvg = `
          <!-- Slide Pill -->
          <rect x="80" y="75" width="290" height="42" rx="21" fill="#064E3B" stroke="#10B981" stroke-width="1.5" />
          <text x="225" y="102" fill="#6EE7B7" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" letter-spacing="1.2" text-anchor="middle">03 · PROVEN RESULTS</text>

          <text x="80" y="175" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="38" font-weight="800">
            Real Metrics from Operational Systems
          </text>
          <text x="80" y="225" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
            Verified numbers from 24/7 telecommunications surveillance and applied AI workflows.
          </text>

          <!-- Twin Stats Cards -->
          <g transform="translate(80, 270)">
            <!-- Card 1 -->
            <rect x="0" y="0" width="440" height="300" rx="24" fill="${theme.cardBg}" stroke="${theme.border}" stroke-width="2" />
            <text x="40" y="65" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">SCALE &amp; RELIABILITY</text>
            <text x="40" y="150" fill="#FFFFFF" font-family="'JetBrains Mono', monospace" font-size="64" font-weight="900">${escapeXml(metrics.metric1)}</text>
            <text x="40" y="195" fill="#38BDF8" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="800">${escapeXml(metrics.label1)}</text>
            <text x="40" y="240" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">${escapeXml(metrics.sub1)}</text>

            <!-- Card 2 -->
            <rect x="480" y="0" width="440" height="300" rx="24" fill="${theme.cardBg}" stroke="#10B981" stroke-width="2" />
            <text x="520" y="65" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">MEASURABLE EFFICIENCY</text>
            <text x="520" y="150" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="64" font-weight="900">${escapeXml(metrics.metric2)}</text>
            <text x="520" y="195" fill="#A7F3D0" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="800">${escapeXml(metrics.label2)}</text>
            <text x="520" y="240" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">${escapeXml(metrics.sub2)}</text>
          </g>

          <!-- Takeaway Card -->
          <g transform="translate(80, 600)">
            <rect x="0" y="0" width="920" height="200" rx="20" fill="#0F172A" stroke="#1E293B" />
            <text x="40" y="50" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="18" font-weight="800">THE TAKEAWAY FOR ENGINEERING TEAMS</text>
            <text x="40" y="95" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="500">
              ${escapeXml(metrics.takeaway.slice(0, 85))}
            </text>
            <text x="40" y="130" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="500">
              ${escapeXml(metrics.takeaway.slice(85, 175))}
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

          <text x="80" y="175" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="38" font-weight="800">
            Operational Rigor &gt; Tool Hype
          </text>
          <text x="80" y="225" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="18">
            Build your foundation on real operational boundaries, and intelligence will follow safely.
          </text>

          <!-- Discussion Question Card -->
          <rect x="80" y="270" width="920" height="270" rx="24" fill="${theme.cardBg}" stroke="${theme.accent}" stroke-width="2" />
          <text x="120" y="325" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700">QUESTION FOR ENGINEERS &amp; BUILDERS</text>
          
          <text x="120" y="380" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="700">
            <tspan x="120" dy="0">${escapeXml(cleanQuestion.slice(0, 55))}</tspan>
            <tspan x="120" dy="38">${escapeXml(cleanQuestion.slice(55, 120))}</tspan>
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

      // Write SVG files
      fs.writeFileSync(svgPath, svgContent, 'utf-8');
      fs.writeFileSync(distSvgPath, svgContent, 'utf-8');

      // Convert and write high-resolution PNG files for LinkedIn feed upload
      try {
        const pngBuffer = sharp(Buffer.from(svgContent)).png().toBuffer();
        pngBuffer.then(buf => {
          fs.writeFileSync(pngPath, buf);
          fs.writeFileSync(distPngPath, buf);
        }).catch(err => {
          console.warn(`PNG generation error on ${pngFilename}:`, err.message);
        });
      } catch (err) {
        console.warn(`Sharp invocation error on ${pngFilename}:`, err.message);
      }

      slideUrls.push(`/media/${svgFilename}`);
    }

    return slideUrls;
  }

  /**
   * Returns a PNG buffer, file path, and filename for LinkedIn API or Webhook upload.
   * If the PNG already exists on disk, reads and returns it.
   * If not, it converts the SVG to PNG with sharp, saves it, and returns it.
   */
  static async getOrGeneratePng(mediaUrlOrPath, fallbackTitle = '', fallbackPillar = 'ai-automation') {
    if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
    if (!fs.existsSync(DIST_MEDIA_DIR)) fs.mkdirSync(DIST_MEDIA_DIR, { recursive: true });

    let rawFilename = 'slide_1.png';
    if (mediaUrlOrPath) {
      const clean = mediaUrlOrPath.split('?')[0];
      const base = path.basename(clean);
      rawFilename = base.endsWith('.svg') ? base.replace('.svg', '.png') : (base.endsWith('.png') ? base : `${base}.png`);
    }

    const pngPath = path.join(MEDIA_DIR, rawFilename);
    const distPngPath = path.join(DIST_MEDIA_DIR, rawFilename);

    // 1. If PNG already exists and has non-zero size, return it
    if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 1000) {
      const buffer = fs.readFileSync(pngPath);
      return {
        buffer,
        pngPath,
        filename: rawFilename,
        mimetype: 'image/png'
      };
    }

    // 2. If SVG exists, convert to PNG with sharp
    const svgFilename = rawFilename.replace('.png', '.svg');
    const svgPath = path.join(MEDIA_DIR, svgFilename);

    if (fs.existsSync(svgPath)) {
      const svgBuffer = fs.readFileSync(svgPath);
      const pngBuffer = await sharp(svgBuffer).png().toBuffer();
      fs.writeFileSync(pngPath, pngBuffer);
      try { fs.writeFileSync(distPngPath, pngBuffer); } catch (_) {}
      return {
        buffer: pngBuffer,
        pngPath,
        filename: rawFilename,
        mimetype: 'image/png'
      };
    }

    // 3. Fallback: generate a clean branded 1080x1080 image with sharp
    const titleText = escapeXml(fallbackTitle || 'Engineering Reliability & NOC Architecture');
    const fallbackSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <rect width="1080" height="1080" fill="#090D16" />
  <rect x="80" y="80" width="920" height="920" rx="24" fill="#0F172A" stroke="#0284C7" stroke-width="2" />
  <text x="140" y="240" fill="#38BDF8" font-family="system-ui, sans-serif" font-size="20" font-weight="800">TELECOMMUNICATIONS &amp; AI AUTOMATION</text>
  <text x="140" y="340" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="44" font-weight="800">${titleText}</text>
  <rect x="140" y="520" width="800" height="240" rx="16" fill="#08152B" stroke="#0369A1" />
  <text x="180" y="600" fill="#38BDF8" font-family="monospace" font-size="18" font-weight="700">789+ NOC NODES · 99.8% SLA DISCIPLINE</text>
  <text x="180" y="650" fill="#CBD5E1" font-family="system-ui, sans-serif" font-size="20">Toluwanimi Taiwo Akinyemi · Pan African Towers NOC Lead</text>
  <text x="140" y="940" fill="#64748B" font-family="monospace" font-size="16">LinkedIn: /in/akinyemi-toluwanimi</text>
</svg>`;
    const fallbackBuffer = await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
    fs.writeFileSync(pngPath, fallbackBuffer);
    try { fs.writeFileSync(distPngPath, fallbackBuffer); } catch (_) {}
    return {
      buffer: fallbackBuffer,
      pngPath,
      filename: rawFilename,
      mimetype: 'image/png'
    };
  }
}
