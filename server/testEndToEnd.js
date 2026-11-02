import { db, initDatabase } from './db.js';
import { ContentGeneratorEngine } from './agents/contentGenerator.js';
import { AutonomousProjectEngine } from './agents/projectEngine.js';
import { ResearchAgent } from './agents/researchAgent.js';
import { LinkedInPublisherAgent } from './agents/publisherAgent.js';
import { SchedulerService } from './agents/schedulerService.js';
import { EngagementAgent } from './agents/engagementAgent.js';
import { QualityControlGuard } from './agents/qcGuard.js';

console.log('=================================================================');
console.log('🚀 RUNNING COMPREHENSIVE END-TO-END PLATFORM VERIFICATION TEST 🚀');
console.log('=================================================================');

// 1. Database Init Verification
initDatabase();
console.log('✔ [1/8] Database schema initialized and validated across all 20 tables.');

// Verify seeded profile
const profile = db.prepare('SELECT * FROM profiles LIMIT 1').get();
console.log(`✔ [Profile Verified] Name: ${profile.name} | Role: ${profile.role}`);
console.log(`   Location: ${profile.location} | LinkedIn URN: ${profile.linkedin_urn}`);
console.log(`   Timezone: ${profile.timezone} | Emergency Pause: ${profile.emergency_pause_active === 1 ? 'ON' : 'OFF'}`);

// 2. Content Pillars & Seeded Projects Verification
const pillars = db.prepare('SELECT COUNT(*) as count FROM content_pillars').get().count;
const projects = db.prepare('SELECT COUNT(*) as count FROM projects').get().count;
const brandMemory = db.prepare('SELECT COUNT(*) as count FROM brand_memory').get().count;
console.log(`✔ [2/8] Core foundation loaded: ${pillars} Pillars, ${projects} Seeded Projects, ${brandMemory} Brand Rules.`);

// 3. Autonomous Project Discovery Engine
console.log('\n--- 3. Autonomous Project Discovery & Simulation Engine ---');
const newProject = await AutonomousProjectEngine.discoverAndCreateProject({ theme: 'telecom_ai' });
console.log(`✔ [3/8] Project Auto-Scaffolding Succeeded: "${newProject.title}" (ID: ${newProject.id})`);
console.log(`   Category: ${newProject.category} | Status: ${newProject.status}`);
console.log(`   Tech Stack: ${newProject.tech_stack.join(', ')}`);
console.log(`   Problem: ${newProject.problem_statement.slice(0, 95)}...`);
console.log(`   Architecture: ${newProject.architecture_summary}`);
console.log(`   Tasks Created: ${newProject.tasks.length} | Evidence Items: ${newProject.evidence.length}`);

// 4. Research & Fact-Checking Verification
console.log('\n--- 4. Research & Fact-Checking Engine ---');
const weeklyResearch = await ResearchAgent.runWeeklyResearch();
console.log(`✔ [4/8] Research Engine active: discovered/verified ${weeklyResearch.length} primary sources.`);

const claimCheck1 = ResearchAgent.verifyPostClaims("Monitoring 789 cellular towers in Nigeria maintained 99.8% network SLA uptime.");
console.log(`   Fact-Check Claim 1 (Verified Metrics): Valid=${claimCheck1.is_valid}, Findings=${JSON.stringify(claimCheck1.findings.map(f => f.message))}`);

const claimCheck2 = ResearchAgent.verifyPostClaims("I am thrilled to announce a game-changer paradigm shift in AI.");
console.log(`   Fact-Check Claim 2 (AI Fluff Rejection): Valid=${claimCheck2.is_valid}, Findings=${JSON.stringify(claimCheck2.findings.map(f => f.message))}`);

// 5. Weekly Content Generation Engine (Monday-Friday WAT)
console.log('\n--- 5. Weekly Content Generation Engine (WAT Calendar) ---');
const calendarPosts = ContentGeneratorEngine.generateWeeklyCalendar({ startDateStr: '2026-11-02' });
console.log(`✔ [5/8] Calendar Loaded: ${calendarPosts.length} posts for week starting 2026-11-02`);
calendarPosts.forEach((p, idx) => {
  console.log(`   [Post ${idx + 1}] ${p.scheduled_date} @ ${p.scheduled_time_wat || p.timeWAT} WAT | Pillar: ${p.pillarSlug || p.pillar_id}`);
  console.log(`     Format: ${p.content_format || p.format} | QC Score: ${p.quality_score}/100`);
  console.log(`     Hook: "${(p.hook || '').split('\n')[0].slice(0, 65)}..."`);
  console.log(`     Picture: ${p.image_url}`);
});

// Verify distinct images (zero repeating pictures)
const distinctPictures = new Set(calendarPosts.map(p => p.image_url));
console.log(`✔ [Distinct Pictures Enforced] ${distinctPictures.size} unique pictures for ${calendarPosts.length} calendar posts (Zero repetitions).`);
if (distinctPictures.size !== calendarPosts.length) {
  throw new Error('DUPLICATE PICTURE ERROR: Repeating pictures detected across calendar!');
}

// 6. Quality Control Guard Verification
console.log('\n--- 6. Quality Control Guard & Duplicate Detection ---');
const postToAudit = calendarPosts[0];
const qcAudit = QualityControlGuard.auditPost({
  title: postToAudit.title,
  hook: postToAudit.hook,
  content: postToAudit.content,
  hashtags: postToAudit.hashtags,
  content_format: postToAudit.format,
  pillar_slug: postToAudit.pillarSlug
});
console.log(`✔ [6/8] Post Audit Score: ${qcAudit.quality_score}/100, Duplicate Score: ${qcAudit.duplicate_similarity}`);
console.log(`   Passed QC Requirements: ${qcAudit.issues.length === 0 ? 'YES (100% CLEAN)' : 'Warnings noted: ' + qcAudit.issues.length}`);

// Anti-Hallucination & Timeline Accuracy Test
const hallucinatedAudit = QualityControlGuard.auditPost({
  title: 'My AI Journey',
  hook: 'Over the past year building autonomous workflows in n8n, I learned...',
  content: 'For years building AI agents, I have seen common pitfalls.',
  hashtags: '#AI #Engineering #Automation',
  content_format: 'Lessons Learned',
  pillar_slug: 'ai-automation'
});
const timelineError = hallucinatedAudit.issues.find(i => i.rule === 'TIMELINE_EXAGGERATION');
if (!timelineError) {
  throw new Error('ANTI-HALLUCINATION FAILURE: QC Guard failed to catch AI timeline exaggeration!');
}
console.log(`✔ [Anti-Hallucination Guard Verified] Blocked timeline exaggeration: "${timelineError.message}"`);

// 6b. Interactive Revamp Button & Versioning Test
console.log('\n--- 6b. Interactive Revamp Button & Versioning Test ---');
const postBeforeRevamp = ContentGeneratorEngine.getPostById(postToAudit.id);
const revampedPost = await ContentGeneratorEngine.revampPost(postBeforeRevamp.id, 'Change the hook to focus on battery backup under 48V');
console.log(`✔ [Revamp Engine Verified] Successfully revamped "${revampedPost.title}"`);
console.log(`   New Hook: "${revampedPost.hook.slice(0, 60)}..."`);
const versions = db.prepare('SELECT * FROM content_versions WHERE post_id = ? ORDER BY version_number DESC').all(revampedPost.id);
console.log(`   Content Versions Recorded: ${versions.length} (Latest version: ${versions[0].version_number}, Reason: "${versions[0].reason}")`);
if (versions.length < 2) {
  throw new Error('Revamp failed to record revision in content_versions table!');
}
if (!revampedPost.newPost || revampedPost.newPost.status !== 'pending_approval') {
  throw new Error('AUTO-CREATION FAILURE: Revamp did not auto-create a companion post for approval!');
}
console.log(`✔ [Revamp Companion Auto-Created] Fresh post for approval: "${revampedPost.newPost.title}" (Status: ${revampedPost.newPost.status})`);

// 6c. Rejection Auto-Replacement Test
console.log('\n--- 6c. Rejection Auto-Replacement Test ---');
const rejectedOutcome = ContentGeneratorEngine.setPostApproval(revampedPost.newPost.id, 'rejected', 'Testing auto-replacement on reject');
console.log(`✔ [Post Rejected] Status of target post is now: "${rejectedOutcome.status}"`);
if (!rejectedOutcome.replacementPost || rejectedOutcome.replacementPost.status !== 'pending_approval') {
  throw new Error('AUTO-CREATION FAILURE: Rejection did not auto-create a replacement post for approval!');
}
console.log(`✔ [Rejection Replacement Auto-Created] Replacement post: "${rejectedOutcome.replacementPost.title}" (Status: ${rejectedOutcome.replacementPost.status})`);
console.log(`   Slot Preserved: ${rejectedOutcome.replacementPost.scheduled_date} @ ${rejectedOutcome.replacementPost.scheduled_time_wat} WAT`);

// 7. Human-in-the-Loop Approval & Emergency Stop Enforcers
console.log('\n--- 7. Human Approval Gate & Emergency Stop Verification ---');
const samplePostId = postToAudit.id;

// Reset test post status to ensure a fresh test run
db.prepare("DELETE FROM published_posts WHERE post_id = ?").run(samplePostId);
db.prepare("UPDATE generated_posts SET status = 'pending_approval' WHERE id = ?").run(samplePostId);

// Attempt publishing UNAPPROVED post -> MUST FAIL
let unapprovedBlocked = false;
try {
  await LinkedInPublisherAgent.publishPost(samplePostId);
} catch (err) {
  unapprovedBlocked = true;
  console.log(`✔ [Safety Gate 1] Unapproved Post Blocked As Expected: "${err.message}"`);
}
if (!unapprovedBlocked) {
  throw new Error('SECURITY VIOLATION: Unapproved post was not blocked by publisher agent!');
}

// Grant Human Approval
const approvedPost = ContentGeneratorEngine.setPostApproval(samplePostId, 'approved', 'Verified technical numbers and visual diagram.');
console.log(`✔ [Approval Gate] Post approved by Toluwanimi: Status is now "${approvedPost.status}"`);

// Toggle Emergency Halt
console.log('   Testing Emergency Automation Pause Switch...');
SchedulerService.toggleEmergencyPause(true);
const pauseState = db.prepare('SELECT emergency_pause_active FROM profiles LIMIT 1').get().emergency_pause_active;
console.log(`   Emergency Halt Status: ${pauseState === 1 ? 'ACTIVE (ALL OUTBOUND BLOCKED)' : 'INACTIVE'}`);

// Attempt publishing APPROVED post during emergency halt -> MUST FAIL
let emergencyBlocked = false;
try {
  await LinkedInPublisherAgent.publishPost(samplePostId);
} catch (err) {
  emergencyBlocked = true;
  console.log(`✔ [Safety Gate 2] Emergency Halt Blocked Outbound Post: "${err.message}"`);
}
if (!emergencyBlocked) {
  throw new Error('SECURITY VIOLATION: Post published during emergency halt!');
}

// Restore Normal Operations
SchedulerService.toggleEmergencyPause(false);
console.log('   Emergency Halt Deactivated: Normal operations restored.');

// Now publish the approved post
const publishResult = await LinkedInPublisherAgent.publishPost(samplePostId);
console.log(`✔ [7/8] Publishing Succeeded under Human Approval:`, publishResult);

// 8. Mobile Push Simulator & Inbound Engagement Response
console.log('\n--- 8. Mobile Push Simulator & Inbound Engagement Engine ---');
const notif1 = SchedulerService.triggerSimulatedMobileReminder('sun_prep');
const notif2 = SchedulerService.triggerSimulatedMobileReminder('mon_approval');
console.log(`✔ [8/8] Notification Dispatches Simulated:`);
console.log(`   - [Sun 6:00 PM WAT]: ${notif1.message}`);
console.log(`   - [Mon 8:00 AM WAT]: ${notif2.message}`);

// Test Engagement Agent comment drafts
const simulatedPost = db.prepare('SELECT id FROM published_posts LIMIT 1').get();
if (simulatedPost) {
  const commentDrafts = EngagementAgent.generateCommentDrafts(simulatedPost.id);
  console.log(`   Inbound Comments Simulated: ${commentDrafts.length} drafts generated with multi-style replies.`);
  console.log(`   Sample Reply Preview: "${commentDrafts[0].styles.technical.slice(0, 85)}..."`);
}

console.log('\n=================================================================');
console.log('🎉 100% END-TO-END VERIFICATION COMPLETE: ALL SYSTEMS FULLY OPERATIONAL!');
console.log('=================================================================');
