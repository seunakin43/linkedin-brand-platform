import { db } from '../db.js';

export class QualityControlGuard {
  /**
   * Computes duplicate similarity against previously generated and published posts.
   */
  static checkDuplicateSimilarity(newPostText, newHook) {
    const existingPosts = db.prepare('SELECT id, hook, content FROM generated_posts').all();
    if (existingPosts.length === 0) return { maxSimilarity: 0.0, similarPostId: null };

    let maxSimilarity = 0.0;
    let similarPostId = null;

    const tokenize = (text) => new Set(text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3));
    const newTokens = tokenize(newPostText + ' ' + newHook);

    for (const post of existingPosts) {
      const existingTokens = tokenize(post.content + ' ' + post.hook);
      const intersection = new Set([...newTokens].filter(x => existingTokens.has(x)));
      const union = new Set([...newTokens, ...existingTokens]);
      const jaccard = union.size === 0 ? 0 : intersection.size / union.size;

      if (jaccard > maxSimilarity) {
        maxSimilarity = jaccard;
        similarPostId = post.id;
      }
    }

    return {
      maxSimilarity: parseFloat(maxSimilarity.toFixed(2)),
      similarPostId,
      isDuplicate: maxSimilarity >= 0.45
    };
  }

  /**
   * Comprehensive Quality Control audit.
   */
  static auditPost({ title, hook, content, hashtags, content_format, pillar_slug, image_url, postId }) {
    const issues = [];
    const lowerContent = content.toLowerCase();

    // 1. Check Hook Length (< 210 characters before mobile "see more" cutoff)
    if (hook.length > 210) {
      issues.push({
        severity: 'warning',
        rule: 'HOOK_LENGTH',
        message: `Opening hook is ${hook.length} characters (recommended < 200 chars for mobile cutoff preview).`
      });
    }

    // 2. Check Paragraph Spacing (avoid dense blocks > 4 lines)
    const paragraphs = content.split(/\n\s*\n/);
    for (let i = 0; i < paragraphs.length; i++) {
      const lineCount = paragraphs[i].split('\n').length;
      if (lineCount > 5) {
        issues.push({
          severity: 'warning',
          rule: 'DENSE_PARAGRAPH',
          message: `Paragraph ${i + 1} contains ${lineCount} lines. Split into single-thought sentences for mobile scannability.`
        });
      }
    }

    // 3. Corporate Fluff & Stock AI words check
    const forbiddenWords = ['game-changer', 'thrilled to announce', 'excited to share', 'paradigm shift', 'delve', 'testament', 'beacon', 'unleash', 'harness the power'];
    for (const word of forbiddenWords) {
      if (lowerContent.includes(word)) {
        issues.push({
          severity: 'error',
          rule: 'FORBIDDEN_AI_CLICHE',
          message: `Contains AI cliche: "${word}". Rephrase with direct, authentic human engineering vocabulary.`
        });
      }
    }

    // 4. Excluded Tools Check (React & Tailwind CSS removed per user brand profile)
    if (/\breact\b/i.test(content) || /\btailwind\b/i.test(content)) {
      issues.push({
        severity: 'warning',
        rule: 'EXCLUDED_TOOL_MENTION',
        message: 'Post mentions React or Tailwind CSS. Toluwanimi brand profile specifies excluding frontend library claims in favor of AI automation and telecom architecture.'
      });
    }

    // 5. Timeline Accuracy & Anti-Hallucination Guard
    // Toluwanimi started AI automation a few months ago as an active learner / developing AI Generalist.
    // Deep long-term experience is strictly in Telecommunications NOC Operations (789+ nodes, 99.8% SLA).
    const aiTimelineExaggerations = [
      /past\s+year\s+.*ai/i,
      /over\s+the\s+past\s+year/i,
      /years\s+of\s+(experience\s+in\s+)?(ai|artificial\s+intelligence|machine\s+learning|llm|automation)/i,
      /for\s+years\s+building\s+(ai|agents|automation)/i,
      /decade\s+of\s+ai/i,
      /built\s+ai\s+agents\s+for\s+years/i
    ];
    for (const pattern of aiTimelineExaggerations) {
      if (pattern.test(content) || pattern.test(hook)) {
        issues.push({
          severity: 'error',
          rule: 'TIMELINE_EXAGGERATION',
          message: 'Timeline Hallucination Detected: Toluwanimi began AI automation a few months ago (active learner & developing AI Generalist). Ground multi-year operational claims exclusively in verified Telecommunications NOC Operations (789+ nodes).'
        });
      }
    }

    // 6. Confidentiality & Security Risk Check
    const sensitivePatterns = [
      /password\s*[:=]/i,
      /api[_-]?key\s*[:=]/i,
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // raw IP
      /secret\s*[:=]/i
    ];
    for (const pattern of sensitivePatterns) {
      if (pattern.test(content)) {
        issues.push({
          severity: 'error',
          rule: 'CONFIDENTIALITY_LEAK',
          message: 'Potential security / IP credential detected in post copy. Remove sensitive internal strings.'
        });
      }
    }

    // 5. Hashtag verification (3 to 5 hashtags optimal)
    const tags = hashtags.split(/[,\s]+/).filter(t => t.startsWith('#') || t.length > 1);
    if (tags.length < 3 || tags.length > 6) {
      issues.push({
        severity: 'info',
        rule: 'HASHTAG_COUNT',
        message: `Found ${tags.length} hashtags. Ideal LinkedIn algorithm range is 3 to 5 targeted tags.`
      });
    }

    // 6. Distinct Picture Verification (Mandatory: Zero duplicate pictures across calendar)
    if (image_url) {
      const duplicateImage = db.prepare('SELECT id, title FROM generated_posts WHERE image_url = ? AND id != ?').get(image_url, postId || '');
      if (duplicateImage) {
        issues.push({
          severity: 'error',
          rule: 'DUPLICATE_PICTURE_DETECTED',
          message: `This picture is already assigned to post "${duplicateImage.title}". Every post must have a completely distinct picture.`
        });
      }
    }

    // 7. Duplicate copy check
    const dupCheck = this.checkDuplicateSimilarity(content, hook);
    if (dupCheck.isDuplicate) {
      issues.push({
        severity: 'error',
        rule: 'DUPLICATE_CONTENT',
        message: `High similarity (${Math.round(dupCheck.maxSimilarity * 100)}%) detected with existing post ${dupCheck.similarPostId}. Diversify angle.`
      });
    }

    // Calculate quality score (0 - 100)
    let score = 100;
    for (const issue of issues) {
      if (issue.severity === 'error') score -= 20;
      else if (issue.severity === 'warning') score -= 8;
      else if (issue.severity === 'info') score -= 3;
    }
    score = Math.max(0, Math.min(100, score));

    return {
      passed: issues.filter(i => i.severity === 'error').length === 0,
      quality_score: score,
      duplicate_similarity: dupCheck.maxSimilarity,
      issues
    };
  }
}
