import { db } from '../db.js';
import crypto from 'node:crypto';

export class EngagementAgent {
  /**
   * Generates AI draft replies to incoming post comments.
   * All replies remain in 'draft' status until the user approves them.
   */
  static generateCommentDrafts(publishedPostId) {
    const post = db.prepare('SELECT p.title FROM published_posts pb JOIN generated_posts p ON pb.post_id = p.id WHERE pb.id = ?').get(publishedPostId);
    const postTitle = post ? post.title : 'Telecom & AI Infrastructure';

    const simulatedInboundComments = [
      {
        commenter_name: 'David Adeleke',
        commenter_urn: 'urn:li:person:dav-adeleke-942',
        comment_text: 'Spot on regarding RCA templates. How do you handle edge cases where generator telemetry reports healthy fuel levels but the alternator fails during cutover?',
        styles: {
          technical: 'Great question, David. In our OWS monitoring setup, we cross-correlate fuel sensor data with AC phase output voltage within 45 seconds of grid cutover. If the generator contactor closes but line voltage remains under 210VAC, an immediate "Mechanical Crank Failure" alarm triggers, bypassing the fuel sensor altogether.',
          professional: 'Thanks David! We treat alternator output as an independent telemetry vector from fuel levels to catch mechanical failure points early.',
          thought_provoking: 'That exact scenario is why single-sensor monitoring fails in hybrid infrastructure. How does your team validate generator cutover health currently?'
        }
      },
      {
        commenter_name: 'Sarah Chen, CTO',
        commenter_urn: 'urn:li:person:sarah-chen-cto',
        comment_text: 'Love the focus on deterministic guardrails for AI. Are you using JSON schema validation directly inside your edge functions or running a separate validation proxy?',
        styles: {
          technical: 'We run JSON schema validators directly inside our Supabase edge functions prior to any database mutation. If the model output violates the schema, the function retries with an explicit error correction prompt before failing over.',
          friendly: 'Thanks Sarah! Yes, JSON schema validation directly at the function edge has saved us countless hours of debugging messy LLM outputs.',
          professional: 'Appreciate the feedback, Sarah! JSON schema validation right at the ingress boundary has proven essential for keeping production error rates under 0.5%.'
        }
      }
    ];

    const draftsCreated = [];
    const insertStmt = db.prepare(`
      INSERT INTO comment_drafts (id, published_post_id, commenter_name, commenter_urn, comment_text, suggested_reply, reply_style, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of simulatedInboundComments) {
      const draftId = `cmt-${crypto.randomUUID().slice(0, 8)}`;
      insertStmt.run(
        draftId,
        publishedPostId,
        c.commenter_name,
        c.commenter_urn,
        c.comment_text,
        c.styles.technical,
        'technical',
        'draft'
      );
      draftsCreated.push({ id: draftId, ...c });
    }

    return draftsCreated;
  }

  static getCommentDrafts() {
    return db.prepare(`
      SELECT cd.*, gp.title as post_title
      FROM comment_drafts cd
      JOIN published_posts pb ON cd.published_post_id = pb.id
      JOIN generated_posts gp ON pb.post_id = gp.id
      ORDER BY cd.created_at DESC
    `).all();
  }

  static approveCommentDraft(id, customText = null) {
    if (customText) {
      db.prepare("UPDATE comment_drafts SET suggested_reply = ?, status = 'approved' WHERE id = ?").run(customText, id);
    } else {
      db.prepare("UPDATE comment_drafts SET status = 'approved' WHERE id = ?").run(id);
    }
    return { success: true, id };
  }

  // --- LEADS TRACKER ---
  static addLead({ contact_name, profile_url, company, role, opportunity_type, notes }) {
    const id = `lead-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO professional_leads (id, contact_name, profile_url, company, role, opportunity_type, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, contact_name, profile_url, company, role, opportunity_type, notes, 'new');

    return { id, contact_name, company, opportunity_type };
  }

  static getLeads() {
    return db.prepare('SELECT * FROM professional_leads ORDER BY created_at DESC').all();
  }

  static updateLeadStatus(id, status) {
    db.prepare('UPDATE professional_leads SET status = ? WHERE id = ?').run(status, id);
    return { success: true, id, status };
  }
}
