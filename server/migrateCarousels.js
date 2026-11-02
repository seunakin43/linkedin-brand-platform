import { db } from './db.js';
import { DynamicCarouselGenerator } from './agents/carouselGenerator.js';

console.log('🔄 Starting carousel generation for all posts in database...');

// Ensure column exists
try {
  db.exec("ALTER TABLE generated_posts ADD COLUMN carousel_slides TEXT");
} catch (e) {}

const posts = db.prepare(`
  SELECT p.*, cp.slug as pillar_slug, cp.name as pillar_name
  FROM generated_posts p
  LEFT JOIN content_pillars cp ON p.pillar_id = cp.id
`).all();

console.log(`Found ${posts.length} posts to process.`);

let count = 0;
for (const p of posts) {
  try {
    const slides = DynamicCarouselGenerator.generateCarousel({
      postId: p.id,
      title: p.title,
      hook: p.hook || '',
      content: p.content || '',
      pillarSlug: p.pillar_slug || 'ai-automation',
      pillarName: p.pillar_name || 'AI Automation',
      contentFormat: p.content_format || 'Architecture',
      hashtags: p.hashtags || '',
      audienceQuestion: p.audience_question || ''
    });

    db.prepare(`
      UPDATE generated_posts
      SET carousel_slides = ?, image_url = ?
      WHERE id = ?
    `).run(JSON.stringify(slides), slides[0], p.id);

    count++;
    console.log(`✔ [${count}/${posts.length}] Generated 5 slides for "${p.title.slice(0, 40)}..." (ID: ${p.id})`);
  } catch (err) {
    console.error(`❌ Error on post ${p.id}:`, err);
  }
}

console.log(`\n🎉 Successfully generated multi-slide carousels for ${count} posts!`);
