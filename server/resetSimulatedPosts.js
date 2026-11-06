import { db } from './db.js';

const livePostIds = ['post-2198a4ec', 'post-0704a25d'];
const simulatedPostIds = [
  'post-11479d67',
  'post-240cb878',
  'post-2cb53f70',
  'post-0abe9369',
  'post-bed7bb22',
  'post-09ce9182'
];

// Clean published_posts so only real live shares remain
db.prepare('DELETE FROM published_posts WHERE post_id NOT IN (?, ?)').run(...livePostIds);

// Reset unposted posts back to 'approved' and 'queued'
for (const id of simulatedPostIds) {
  db.prepare("UPDATE generated_posts SET status = 'approved', updated_at = datetime('now') WHERE id = ?").run(id);
  db.prepare("UPDATE publishing_schedule SET status = 'queued', last_error = null, updated_at = datetime('now') WHERE post_id = ?").run(id);
}

console.log('✔ Reset simulated posts to approved status with queued schedule!');
