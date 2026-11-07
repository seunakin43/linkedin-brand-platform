import { db } from '../db.js';
import crypto from 'node:crypto';
import { DynamicCarouselGenerator } from './carouselGenerator.js';

export class LinkedInPublisherAgent {
  /**
   * Publishes an approved post to LinkedIn.
   * Enforces:
   * 1. Emergency Pause check
   * 2. Mandatory Human Approval check
   * 3. Duplicate Publication prevention
   * 4. Media asset binding
   */
  static async publishPost(postId, { forceManualFallback = false, allowExplicitUserPublish = false } = {}) {
    // 1. Check Emergency Pause
    const profile = db.prepare('SELECT emergency_pause_active, linkedin_urn FROM profiles LIMIT 1').get();
    if (profile && profile.emergency_pause_active === 1) {
      throw new Error('EMERGENCY_PAUSE_ACTIVE: Publishing halted by emergency pause switch.');
    }

    // 2. Fetch Post
    const post = db.prepare('SELECT * FROM generated_posts WHERE id = ?').get(postId);
    if (!post) throw new Error('Post not found');

    // 3. Mandatory Human Approval verification
    if (post.status !== 'approved' && post.status !== 'published') {
      if (allowExplicitUserPublish) {
        db.prepare("UPDATE generated_posts SET status = 'approved', updated_at = datetime('now') WHERE id = ?").run(postId);
        post.status = 'approved';
      } else {
        throw new Error(`APPROVAL_REQUIRED: Post status is "${post.status}". Human approval is mandatory before publishing.`);
      }
    }

    // 4. Duplicate Publication Guard
    const alreadyPublished = db.prepare('SELECT id, linkedin_share_urn, permalink FROM published_posts WHERE post_id = ?').get(postId);
    if (alreadyPublished) {
      return {
        published_id: alreadyPublished.id,
        success: true,
        share_urn: alreadyPublished.linkedin_share_urn,
        permalink: alreadyPublished.permalink,
        mode: 'ALREADY_PUBLISHED',
        web_intent_url: 'https://www.linkedin.com/feed/?shareActive=true',
        full_text: `${post.hook}\n\n${post.content}\n\n${post.hashtags}`
      };
    }

    // Build the post body
    const fullText = `${post.hook}\n\n${post.content}\n\n${post.hashtags}`;

    let publishResult = null;

    if (!forceManualFallback) {
      try {
        const getConfig = (key) => {
          try {
            return db.prepare("SELECT value FROM brand_memory WHERE category = 'config' AND key = ? LIMIT 1").get(key)?.value;
          } catch (_) {
            return null;
          }
        };

        const webhookUrl = process.env.PUBLISH_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || getConfig('publish_webhook_url');
        const composioKey = process.env.COMPOSIO_API_KEY || getConfig('composio_api_key');
        const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN || getConfig('linkedin_access_token');

        // Prepare high-resolution PNG image asset for LinkedIn feed publication
        let imageAsset = null;
        try {
          const primarySlide = post.image_url || (post.carousel_slides ? JSON.parse(post.carousel_slides)[0] : null);
          imageAsset = await DynamicCarouselGenerator.getOrGeneratePng(primarySlide, post.title, post.pillar_slug);
        } catch (imgErr) {
          console.warn('[PublisherAgent] Image asset generation warning:', imgErr.message);
        }

        // 1. Webhook Connector (Make.com, n8n, Zapier) - Passes full text, base64 PNG, and carousel links
        if (webhookUrl) {
          const carouselSlides = post.carousel_slides ? JSON.parse(post.carousel_slides) : [post.image_url];
          const hookPayload = {
            post_id: post.id,
            title: post.title,
            hook: post.hook,
            content: post.content,
            hashtags: post.hashtags,
            first_comment: post.first_comment,
            full_text: fullText,
            image_url: post.image_url,
            image_png_url: post.image_url ? post.image_url.replace('.svg', '.png') : null,
            image_base64: imageAsset ? imageAsset.buffer.toString('base64') : null,
            image_mimetype: 'image/png',
            image_filename: imageAsset ? imageAsset.filename : `${post.id}.png`,
            carousel_slides: carouselSlides,
            carousel_png_slides: carouselSlides.map(s => s.replace('.svg', '.png')),
            author_urn: profile?.linkedin_urn || 'urn:li:person:-XwFu54idT',
            timestamp: new Date().toISOString()
          };

          const hookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hookPayload)
          });

          if (hookRes.ok) {
            const hookData = await hookRes.json().catch(() => ({}));
            const shareUrn = hookData.share_urn || hookData.id || `urn:li:share:webhook:${Date.now()}`;
            publishResult = {
              success: true,
              share_urn: shareUrn,
              permalink: hookData.permalink || `https://www.linkedin.com/in/akinyemi-toluwanimi/recent-activity/all/`,
              mode: 'MAKE_N8N_WEBHOOK_AUTOMATION',
              web_intent_url: 'https://www.linkedin.com/feed/?shareActive=true',
              full_text: fullText
            };
          }
        }

        // 2. Direct Composio REST API Integration (with LinkedIn native image upload & attachment)
        if (!publishResult && composioKey) {
          try {
            const authorUrn = profile?.linkedin_urn || 'urn:li:person:-XwFu54idT';
            let uploadedAssetUrn = null;

            // Step A: If PNG image is available, register image upload on LinkedIn
            if (imageAsset && imageAsset.buffer) {
              try {
                const regRes = await fetch('https://backend.composio.dev/api/v1/actions/LINKEDIN_REGISTER_IMAGE_UPLOAD/execute', {
                  method: 'POST',
                  headers: {
                    'x-api-key': composioKey,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    connectedAccountId: 'linkedin_semble-tera',
                    arguments: {
                      owner_urn: authorUrn,
                      recipe: 'urn:li:digitalmediaRecipe:feedshare-image'
                    }
                  })
                });

                if (regRes.ok) {
                  const regData = await regRes.json();
                  const uploadUrl = regData.data?.upload_url || regData.data?.upload_mechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
                  const assetUrn = regData.data?.asset_urn || regData.data?.asset;

                  if (uploadUrl && assetUrn) {
                    // Step B: Upload image binary bytes to LinkedIn presigned upload URL
                    const putRes = await fetch(uploadUrl, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'image/png',
                        'media-type-family': 'STILLIMAGE'
                      },
                      body: imageAsset.buffer
                    });

                    if (putRes.ok || putRes.status === 201) {
                      uploadedAssetUrn = assetUrn;
                      console.log(`[PublisherAgent] Successfully uploaded ${imageAsset.filename} to LinkedIn asset: ${uploadedAssetUrn}`);
                    } else {
                      console.warn('[PublisherAgent] Binary PUT to LinkedIn returned status:', putRes.status);
                    }
                  }
                } else {
                  console.warn('[PublisherAgent] LINKEDIN_REGISTER_IMAGE_UPLOAD returned non-200:', regRes.status);
                }
              } catch (imgUpErr) {
                console.warn('[PublisherAgent] Image upload step failed, continuing with post:', imgUpErr.message);
              }
            }

            // Step C: Build post arguments with attached picture if uploadedAssetUrn is ready
            const postArgs = {
              author: authorUrn,
              commentary: fullText,
              visibility: 'PUBLIC'
            };

            if (uploadedAssetUrn) {
              postArgs.images = [
                {
                  name: imageAsset ? imageAsset.filename : `${post.id}.png`,
                  mimetype: 'image/png',
                  s3key: uploadedAssetUrn
                }
              ];
            }

            const compRes = await fetch('https://backend.composio.dev/api/v1/actions/LINKEDIN_CREATE_LINKED_IN_POST/execute', {
              method: 'POST',
              headers: {
                'x-api-key': composioKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                connectedAccountId: 'linkedin_semble-tera',
                arguments: postArgs
              })
            });

            if (compRes.ok) {
              const compData = await compRes.json();
              const shareUrn = compData.data?.x_restli_id || compData.data?.id || `urn:li:share:${Date.now()}`;
              publishResult = {
                success: true,
                share_urn: shareUrn,
                permalink: `https://www.linkedin.com/feed/update/${shareUrn}/`,
                mode: uploadedAssetUrn ? 'COMPOSIO_REST_API_WITH_IMAGE' : 'COMPOSIO_REST_API',
                web_intent_url: 'https://www.linkedin.com/feed/?shareActive=true',
                full_text: fullText,
                image_attached: Boolean(uploadedAssetUrn)
              };
            } else {
              const errBody = await compRes.text();
              console.warn('Composio REST API returned non-200:', compRes.status, errBody);
            }
          } catch (compErr) {
            console.warn('Composio API request failed:', compErr.message);
          }
        }

        // 3. Direct LinkedIn Official OAuth Access Token (with native Image URN upload)
        if (!publishResult && linkedinToken) {
          const profileUrn = profile?.linkedin_urn || 'urn:li:person:-XwFu54idT';
          let directAssetUrn = null;

          if (imageAsset && imageAsset.buffer) {
            try {
              const regRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${linkedinToken}`,
                  'Content-Type': 'application/json',
                  'X-Restli-Protocol-Version': '2.0.0'
                },
                body: JSON.stringify({
                  registerUploadRequest: {
                    recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                    owner: profileUrn,
                    serviceRelationships: [
                      {
                        relationshipType: 'OWNER',
                        identifier: 'urn:li:userGeneratedContent'
                      }
                    ]
                  }
                })
              });

              if (regRes.ok) {
                const regData = await regRes.json();
                const uploadUrl = regData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
                const asset = regData.value?.asset;

                if (uploadUrl && asset) {
                  const putRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${linkedinToken}`,
                      'Content-Type': 'image/png'
                    },
                    body: imageAsset.buffer
                  });
                  if (putRes.ok || putRes.status === 201) {
                    directAssetUrn = asset;
                  }
                }
              }
            } catch (dErr) {
              console.warn('Direct LinkedIn image upload error:', dErr.message);
            }
          }

          const liRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${linkedinToken}`,
              'Content-Type': 'application/json',
              'X-Restli-Protocol-Version': '2.0.0'
            },
            body: JSON.stringify({
              author: profileUrn,
              lifecycleState: 'PUBLISHED',
              specificContent: {
                'com.linkedin.ugc.ShareContent': {
                  shareCommentary: { text: fullText },
                  shareMediaCategory: directAssetUrn ? 'IMAGE' : 'NONE',
                  media: directAssetUrn ? [
                    {
                      status: 'READY',
                      description: { text: post.title },
                      media: directAssetUrn,
                      title: { text: post.title }
                    }
                  ] : []
                }
              },
              visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
            })
          });

          if (liRes.ok) {
            const liData = await liRes.json();
            const shareUrn = liData.id || `urn:li:share:${Date.now()}`;
            publishResult = {
              success: true,
              share_urn: shareUrn,
              permalink: `https://www.linkedin.com/feed/update/${shareUrn}/`,
              mode: directAssetUrn ? 'LIVE_LINKEDIN_REST_API_WITH_IMAGE' : 'LIVE_LINKEDIN_REST_API',
              web_intent_url: 'https://www.linkedin.com/feed/?shareActive=true',
              full_text: fullText
            };
          }
        }
      } catch (err) {
        console.warn('Live API attempt failed, reverting to manual fallback:', err.message);
      }
    }

    if (!publishResult) {
      if (!allowExplicitUserPublish) {
        // Headless scheduled run without credentials: Do NOT falsely mark as published!
        throw new Error('NO_OUTBOUND_CHANNEL_CONFIGURED: To enable autonomous cloud publishing, configure a Make.com/n8n webhook URL, Composio API key, or LinkedIn access token in settings or .env. Use "Publish Now" in the dashboard to copy and post via LinkedIn Web Composer.');
      }

      // Explicit human user clicking "Publish Now" in the UI -> Provide Web Intent & clipboard copy
      const shareUrn = `urn:li:share:composer:${Date.now()}`;
      publishResult = {
        success: true,
        share_urn: shareUrn,
        permalink: 'https://www.linkedin.com/feed/?shareActive=true',
        mode: 'WEB_INTENT_COMPOSER',
        web_intent_url: 'https://www.linkedin.com/feed/?shareActive=true',
        full_text: fullText
      };
    }

    // Record published post
    const publishedId = `pub-${crypto.randomUUID().slice(0, 8)}`;
    db.prepare(`
      INSERT INTO published_posts (id, post_id, linkedin_share_urn, permalink, status, response_payload)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      publishedId,
      postId,
      publishResult.share_urn,
      publishResult.permalink,
      'live',
      JSON.stringify(publishResult)
    );

    // Update post status
    db.prepare("UPDATE generated_posts SET status = 'published', updated_at = datetime('now') WHERE id = ?").run(postId);
    db.prepare("UPDATE publishing_schedule SET status = 'published', updated_at = datetime('now') WHERE post_id = ?").run(postId);

    // Initialize metrics record
    db.prepare(`
      INSERT INTO engagement_metrics (id, published_post_id, impressions, reactions, comments, reposts, engagement_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      `met-${crypto.randomUUID().slice(0, 8)}`,
      publishedId,
      0,
      0,
      0,
      0,
      0.0
    );

    // Log automation event
    db.prepare(`
      INSERT INTO automation_logs (id, agent_name, action, details, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `log-${crypto.randomUUID().slice(0, 8)}`,
      'LinkedIn Publishing Agent',
      'POST_PUBLISHED',
      `Published post "${post.title}" with URN: ${publishResult.share_urn} (Mode: ${publishResult.mode}).`,
      'success'
    );

    return {
      published_id: publishedId,
      ...publishResult
    };
  }

  static getPublishedHistory() {
    return db.prepare(`
      SELECT pb.*, gp.title, gp.content, gp.hook, gp.scheduled_date, gp.scheduled_time_wat, em.impressions, em.reactions, em.comments, em.reposts
      FROM published_posts pb
      JOIN generated_posts gp ON pb.post_id = gp.id
      LEFT JOIN engagement_metrics em ON pb.id = em.published_post_id
      ORDER BY pb.published_at_wat DESC
    `).all();
  }
}
