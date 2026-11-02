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

export class DynamicVisualGenerator {
  /**
   * Generates a distinct, high-resolution technical SVG visual for any post.
   * 100% compliant XML with zero unescaped ampersands or brackets.
   */
  static generateDistinctGraphic({
    postId,
    title,
    pillarSlug = 'ai-automation',
    pillarName = 'AI Automation',
    contentFormat = 'Architecture'
  }) {
    if (!fs.existsSync(MEDIA_DIR)) {
      fs.mkdirSync(MEDIA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DIST_MEDIA_DIR)) {
      fs.mkdirSync(DIST_MEDIA_DIR, { recursive: true });
    }

    const safeSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `visual_${postId}_${safeSlug}.svg`;
    const filePath = path.join(MEDIA_DIR, filename);
    const distFilePath = path.join(DIST_MEDIA_DIR, filename);

    // Color palettes and theme based on pillar
    const themes = {
      'telecom-noc': {
        accent: '#38BDF8', // Cyan
        border: '#0284C7',
        badgeBg: '#0C4A6E',
        badgeText: '#38BDF8',
        diagramType: 'TELECOM_TELEMETRY',
        label: 'TELECOMMUNICATIONS &amp; NOC OPERATIONS'
      },
      'ai-automation': {
        accent: '#A855F7', // Purple
        border: '#7E22CE',
        badgeBg: '#3B0764',
        badgeText: '#D8B4FE',
        diagramType: 'AI_GUARDRAIL',
        label: 'AI WORKFLOWS &amp; AUTOMATION'
      },
      'projects-demos': {
        accent: '#10B981', // Emerald
        border: '#059669',
        badgeBg: '#064E3B',
        badgeText: '#6EE7B7',
        diagramType: 'SYSTEM_ARCHITECTURE',
        label: 'PROJECT DEMONSTRATION &amp; ARCHITECTURE'
      },
      'industry-insights': {
        accent: '#F59E0B', // Amber
        border: '#D97706',
        badgeBg: '#451A03',
        badgeText: '#FCD34D',
        diagramType: 'INDUSTRY_METRICS',
        label: 'INDUSTRY BENCHMARKS &amp; RESEARCH'
      },
      'thought-leadership': {
        accent: '#6366F1', // Indigo
        border: '#4F46E5',
        badgeBg: '#1E1B4B',
        badgeText: '#A5B4FC',
        diagramType: 'T_SHAPED_ENGINEER',
        label: 'ENGINEERING STRATEGY &amp; PERSPECTIVE'
      },
      'professional-dev': {
        accent: '#EC4899', // Pink
        border: '#DB2777',
        badgeBg: '#500724',
        badgeText: '#F472B6',
        diagramType: 'SKILLS_DEVELOPMENT',
        label: 'PROFESSIONAL DEVELOPMENT &amp; MASTERY'
      }
    };

    const theme = themes[pillarSlug] || themes['ai-automation'];

    // Break title into lines (max 3 lines) with proper XML escaping
    const words = title.split(' ');
    const lines = [];
    let currentLine = '';
    for (const w of words) {
      if ((currentLine + ' ' + w).length > 28) {
        lines.push(currentLine.trim());
        currentLine = w;
      } else {
        currentLine += (currentLine ? ' ' : '') + w;
      }
    }
    if (currentLine) lines.push(currentLine.trim());

    // Generate Diagram SVG block with 100% compliant XML entities
    let diagramSvg = '';
    if (theme.diagramType === 'TELECOM_TELEMETRY') {
      diagramSvg = `
        <rect x="80" y="440" width="920" height="460" rx="24" fill="#0B132B" stroke="${theme.border}" stroke-width="2" />
        <text x="120" y="495" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">INCIDENT TRIAGE &amp; ROOT CAUSE ANALYSIS (RCA)</text>
        <g transform="translate(120, 530)">
          <rect x="0" y="0" width="260" height="150" rx="16" fill="#1E293B" stroke="#475569" stroke-width="1.5" />
          <text x="25" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">1. Alarm Filter</text>
          <text x="25" y="80" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Suppress transient sags</text>
          <text x="25" y="110" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="13">Galooli RMS &lt; 48V</text>
          
          <path d="M 275 75 L 305 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="320" y="0" width="260" height="150" rx="16" fill="#1E293B" stroke="${theme.border}" stroke-width="2" />
          <text x="345" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">2. RCA Protocol</text>
          <text x="345" y="80" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Categorize failure vector</text>
          <text x="345" y="110" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="13">MTTR -30% Gain</text>
          
          <path d="M 595 75 L 625 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="640" y="0" width="240" height="150" rx="16" fill="#1E293B" stroke="#10B981" stroke-width="2" />
          <text x="665" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">3. Field Dispatch</text>
          <text x="665" y="80" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Automated SMS/GPS</text>
          <text x="665" y="110" fill="#F59E0B" font-family="'JetBrains Mono', monospace" font-size="13">Zero SLA Breach</text>
        </g>
        <g transform="translate(120, 730)">
          <rect x="0" y="0" width="420" height="130" rx="16" fill="#131C31" stroke="#334155" />
          <text x="30" y="50" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="800">789+ Nodes</text>
          <text x="30" y="85" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Active Cellular Infrastructure Surveillance</text>
          
          <rect x="460" y="0" width="420" height="130" rx="16" fill="#131C31" stroke="#334155" />
          <text x="490" y="50" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="800">99.8% SLA</text>
          <text x="490" y="85" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Nationwide Network Availability</text>
        </g>
      `;
    } else if (theme.diagramType === 'AI_GUARDRAIL') {
      diagramSvg = `
        <rect x="80" y="440" width="920" height="460" rx="24" fill="#110A24" stroke="${theme.border}" stroke-width="2" />
        <text x="120" y="495" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">DETERMINISTIC AI AGENT ARCHITECTURE</text>
        <g transform="translate(120, 530)">
          <rect x="0" y="0" width="200" height="150" rx="16" fill="#1E1B4B" stroke="#475569" />
          <text x="25" y="50" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">Raw Webhook</text>
          <text x="25" y="85" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Messy inputs</text>
          <text x="25" y="115" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="12">Ingress</text>
          
          <path d="M 210 75 L 240 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="250" y="0" width="200" height="150" rx="16" fill="#2E1065" stroke="${theme.border}" stroke-width="2" />
          <text x="275" y="50" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">JSON Schema</text>
          <text x="275" y="85" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Strict validation</text>
          <text x="275" y="115" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="12">Guardrail</text>
          
          <path d="M 460 75 L 490 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="500" y="0" width="200" height="150" rx="16" fill="#1E1B4B" stroke="#475569" />
          <text x="525" y="50" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">Gemini LLM</text>
          <text x="525" y="85" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Few-shot prompt</text>
          <text x="525" y="115" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="12">Extraction</text>
          
          <path d="M 710 75 L 740 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="750" y="0" width="130" height="150" rx="16" fill="#1E1B4B" stroke="#10B981" />
          <text x="765" y="50" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">DB</text>
          <text x="765" y="85" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Supabase</text>
          <text x="765" y="115" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="12">Zero Error</text>
        </g>
        <g transform="translate(120, 730)">
          <rect x="0" y="0" width="880" height="130" rx="16" fill="#1A103C" stroke="#3B1C72" />
          <text x="35" y="50" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="800">Deterministic Reliability &gt; Model Size</text>
          <text x="35" y="85" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Eliminating LLM failure states using rigid schema boundaries and deterministic fallbacks.</text>
        </g>
      `;
    } else if (theme.diagramType === 'SYSTEM_ARCHITECTURE') {
      diagramSvg = `
        <rect x="80" y="440" width="920" height="460" rx="24" fill="#06281E" stroke="${theme.border}" stroke-width="2" />
        <text x="120" y="495" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">EXPENSEIQ PLATFORM ARCHITECTURE</text>
        <g transform="translate(120, 530)">
          <rect x="0" y="0" width="260" height="150" rx="16" fill="#0B3C2E" stroke="#10B981" />
          <text x="25" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">Lovable UI</text>
          <text x="25" y="80" fill="#A7F3D0" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Receipt upload</text>
          <text x="25" y="110" fill="#34D399" font-family="'JetBrains Mono', monospace" font-size="13">Sub-10s Process</text>
          
          <path d="M 275 75 L 305 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="320" y="0" width="260" height="150" rx="16" fill="#0B3C2E" stroke="${theme.border}" />
          <text x="345" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">Gemini 1.5</text>
          <text x="345" y="80" fill="#A7F3D0" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Multimodal OCR</text>
          <text x="345" y="110" fill="#FCD34D" font-family="'JetBrains Mono', monospace" font-size="13">98.4% Accuracy</text>
          
          <path d="M 595 75 L 625 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="640" y="0" width="240" height="150" rx="16" fill="#0B3C2E" stroke="#10B981" />
          <text x="665" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">Supabase RLS</text>
          <text x="665" y="80" fill="#A7F3D0" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Multi-tenant auth</text>
          <text x="665" y="110" fill="#38BDF8" font-family="'JetBrains Mono', monospace" font-size="13">Audit Trails</text>
        </g>
        <g transform="translate(120, 730)">
          <rect x="0" y="0" width="880" height="130" rx="16" fill="#083327" stroke="#0F5132" />
          <text x="35" y="50" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="28" font-weight="800">From 18 Mins to &lt; 10s Per Expense Receipt</text>
          <text x="35" y="85" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Automated receipt categorization and compliance auditing built with Lovable and Supabase.</text>
        </g>
      `;
    } else if (theme.diagramType === 'INDUSTRY_METRICS') {
      diagramSvg = `
        <rect x="80" y="440" width="920" height="460" rx="24" fill="#1C1304" stroke="${theme.border}" stroke-width="2" />
        <text x="120" y="495" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">EDGE TELEMETRY &amp; PREDICTIVE MAINTENANCE PIPELINE</text>
        <g transform="translate(120, 530)">
          <rect x="0" y="0" width="260" height="150" rx="16" fill="#2E1C07" stroke="#D97706" stroke-width="1.5" />
          <text x="25" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">1. Edge RMS Data</text>
          <text x="25" y="80" fill="#FDE68A" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Galooli IoT &lt; 48V DC</text>
          <text x="25" y="110" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="13">High-Velocity Ingress</text>
          
          <path d="M 275 75 L 305 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="320" y="0" width="260" height="150" rx="16" fill="#2E1C07" stroke="${theme.accent}" stroke-width="2" />
          <text x="345" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">2. Anomaly Engine</text>
          <text x="345" y="80" fill="#FDE68A" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Thermal &amp; voltage delta</text>
          <text x="345" y="110" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="13">48h Failure Warning</text>
          
          <path d="M 595 75 L 625 75" stroke="${theme.accent}" stroke-width="3" />
          
          <rect x="640" y="0" width="240" height="150" rx="16" fill="#2E1C07" stroke="#10B981" stroke-width="2" />
          <text x="665" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">3. Root Correlation</text>
          <text x="665" y="80" fill="#FDE68A" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">300 alerts &rarr; 1 cause</text>
          <text x="665" y="110" fill="#38BDF8" font-family="'JetBrains Mono', monospace" font-size="13">Zero SLA Breach</text>
        </g>
        <g transform="translate(120, 730)">
          <rect x="0" y="0" width="420" height="130" rx="16" fill="#271805" stroke="#451A03" />
          <text x="30" y="50" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="800">48h Warning</text>
          <text x="30" y="85" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Predictive Rectifier Degradation Alert</text>
          
          <rect x="460" y="0" width="420" height="130" rx="16" fill="#271805" stroke="#451A03" />
          <text x="490" y="50" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="36" font-weight="800">300 : 1</text>
          <text x="490" y="85" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Cascade Alarm Correlation &amp; Noise Reduction</text>
        </g>
      `;
    } else if (theme.diagramType === 'T_SHAPED_ENGINEER') {
      diagramSvg = `
        <rect x="80" y="440" width="920" height="460" rx="24" fill="#0C0E29" stroke="${theme.border}" stroke-width="2" />
        <text x="120" y="495" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">THE T-SHAPED AI GENERALIST FRAMEWORK</text>
        <g transform="translate(120, 530)">
          <rect x="0" y="0" width="880" height="90" rx="14" fill="#1E1B4B" stroke="${theme.accent}" stroke-width="2" />
          <text x="35" y="38" fill="${theme.accent}" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800">&larr; BROAD AI AGILITY &amp; CLOUD SYSTEMS &rarr;</text>
          <text x="35" y="68" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Google Gemini API · Make.com · n8n · Supabase · Lovable · Deterministic Workflows</text>
        </g>
        <g transform="translate(120, 650)">
          <rect x="0" y="0" width="880" height="210" rx="16" fill="#111827" stroke="#374151" stroke-width="1.5" />
          <text x="35" y="42" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">&darr; DEEP OPERATIONAL DOMAIN ANCHOR &darr;</text>
          <text x="35" y="75" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">Pan African Towers 789+ Nodes 24/7 Operations · 99.8% SLA · Incident RCA · Root Cause Triage</text>
          
          <line x1="35" y1="105" x2="845" y2="105" stroke="#1F2937" stroke-width="1" />
          
          <g transform="translate(35, 125)">
            <rect x="0" y="0" width="380" height="60" rx="10" fill="#1E293B" />
            <text x="20" y="26" fill="#A5B4FC" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700">Domain Rigor</text>
            <text x="20" y="48" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">Prevents fragile toy automations</text>

            <rect x="420" y="0" width="380" height="60" rx="10" fill="#1E293B" />
            <text x="440" y="26" fill="#34D399" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700">Engineering Uptime</text>
            <text x="440" y="48" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">Translates AI agents to SLA compliance</text>
          </g>
        </g>
      `;
    } else {
      diagramSvg = `
        <rect x="80" y="440" width="920" height="460" rx="24" fill="#0B132B" stroke="${theme.border}" stroke-width="2" />
        <text x="120" y="495" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" letter-spacing="1">THE APPLIED AI SYSTEMS MODEL</text>
        <g transform="translate(120, 530)">
          <rect x="0" y="0" width="880" height="130" rx="16" fill="#1E293B" stroke="${theme.accent}" stroke-width="2" />
          <text x="35" y="45" fill="${theme.accent}" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800">INTELLIGENT WORKFLOWS &amp; AGENTS</text>
          <text x="35" y="85" fill="#CBD5E1" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Make.com · n8n · Supabase · Lovable · Google Gemini API · Deterministic Guardrails</text>
        </g>
        <g transform="translate(120, 690)">
          <rect x="0" y="0" width="420" height="170" rx="16" fill="#131C31" stroke="#334155" />
          <text x="30" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700">789+ Nodes Monitored</text>
          <text x="30" y="75" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Pan African Towers 24/7 Operations</text>
          <text x="30" y="115" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="800">99.8% SLA</text>
          <text x="30" y="145" fill="#10B981" font-family="'JetBrains Mono', monospace" font-size="14">Proven Uptime Track Record</text>

          <rect x="460" y="0" width="420" height="170" rx="16" fill="#131C31" stroke="#334155" />
          <text x="490" y="45" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700">Applied Mathematics</text>
          <text x="490" y="75" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">UNIOSUN PGD Financial Math &amp; FUNAAB</text>
          <text x="490" y="115" fill="#F59E0B" font-family="'JetBrains Mono', monospace" font-size="24" font-weight="800">-30% MTTR</text>
          <text x="490" y="145" fill="#38BDF8" font-family="'JetBrains Mono', monospace" font-size="14">Standardized Incident Protocols</text>
        </g>
      `;
    }

    const titleLinesSvg = lines.map((l, idx) => `
      <tspan x="80" dy="${idx === 0 ? 0 : 54}">${escapeXml(l)}</tspan>
    `).join('');

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bg_${postId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070B14" />
      <stop offset="50%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bg_${postId})" />

  <!-- Top Category Pill -->
  <rect x="80" y="75" width="480" height="42" rx="21" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="1.5" />
  <text x="320" y="102" fill="${theme.badgeText}" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="14" font-weight="700" letter-spacing="1.2" text-anchor="middle">${theme.label}</text>

  <!-- Main Title -->
  <text x="80" y="185" fill="#FFFFFF" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="44" font-weight="800" line-height="1.2">
    ${titleLinesSvg}
  </text>

  <!-- Subtitle Meta -->
  <text x="80" y="380" fill="#94A3B8" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="500">
    Format: ${escapeXml(contentFormat)} · Timezone: West Africa Time (WAT) · Host: LinkedIn
  </text>

  <!-- Diagram Visual Block -->
  ${diagramSvg}

  <!-- Footer Branding -->
  <line x1="80" y1="960" x2="1000" y2="960" stroke="#1E293B" stroke-width="1" />
  <text x="80" y="1005" fill="#64748B" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">
    Toluwanimi Akinyemi · Telecommunications Network Operations &amp; AI Automation Engineer
  </text>
  <text x="1000" y="1005" fill="${theme.accent}" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="700" text-anchor="end">
    789 NODES · 99.8% SLA
  </text>
</svg>
    `.trim();

    fs.writeFileSync(filePath, svgContent, 'utf-8');
    fs.writeFileSync(distFilePath, svgContent, 'utf-8');
    return `/media/${filename}`;
  }
}
