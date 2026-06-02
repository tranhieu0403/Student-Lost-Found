const { pool } = require('../../config/db');
const notificationService = require('../notifications/notification.service');

function tokenizeLocation(location = '') {
  return location
    .toLowerCase()
    .split(/[\s,.-]+/)
    .filter((token) => token.length > 2);
}

function hasLocationOverlap(sourceLocation, targetLocation) {
  const sourceTokens = tokenizeLocation(sourceLocation);
  const targetText = (targetLocation || '').toLowerCase();
  return sourceTokens.some((token) => targetText.includes(token));
}

exports.findMatches = async (postId) => {
  const [posts] = await pool.query(
    `SELECT id, user_id, category_id, post_type, title, description, location, incident_date
     FROM posts
     WHERE id = ? AND is_deleted = 0 AND status <> 'resolved'
     LIMIT 1`,
    [postId]
  );

  const sourcePost = posts[0];
  if (!sourcePost) {
    return [];
  }

  const oppositeType = sourcePost.post_type === 'lost' ? 'found' : 'lost';
  const [candidates] = await pool.query(
    `SELECT
      p.id, p.user_id, p.category_id, p.post_type, p.title, p.description, p.location, p.incident_date,
      MATCH(p.title, p.description) AGAINST (? IN NATURAL LANGUAGE MODE) AS fulltext_score
     FROM posts p
     WHERE p.post_type = ? AND p.id <> ? AND p.is_deleted = 0 AND p.status <> 'resolved'`,
    [sourcePost.title, oppositeType, sourcePost.id]
  );

  const upserted = [];
  for (const candidate of candidates) {
    let score = 0;
    if (sourcePost.category_id && candidate.category_id && sourcePost.category_id === candidate.category_id) {
      score += 3;
    }
    if (hasLocationOverlap(sourcePost.location, candidate.location)) {
      score += 2;
    }
    if (Number(candidate.fulltext_score) > 0) {
      score += 2;
    }
    if (sourcePost.incident_date && candidate.incident_date) {
      const [dateDiffRows] = await pool.query(
        'SELECT ABS(DATEDIFF(?, ?)) AS diff_days',
        [sourcePost.incident_date, candidate.incident_date]
      );
      if (dateDiffRows[0].diff_days <= 7) {
        score += 1;
      }
    }

    if (score < 3) {
      continue;
    }

    const lostPostId = sourcePost.post_type === 'lost' ? sourcePost.id : candidate.id;
    const foundPostId = sourcePost.post_type === 'found' ? sourcePost.id : candidate.id;

    await pool.query(
      `INSERT INTO matches (lost_post_id, found_post_id, score)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [lostPostId, foundPostId, score]
    );

    upserted.push({ lost_post_id: lostPostId, found_post_id: foundPostId, score });

    void notificationService.sendNewMatchNotification({
      ownerId: sourcePost.user_id,
      postId: sourcePost.id,
      postTitle: sourcePost.title,
      matchPostTitle: candidate.title,
    });
  }

  return upserted;
};

exports.getMatchesForPost = async (postId) => {
  const [rows] = await pool.query(
    `SELECT
      m.id, m.score, m.created_at,
      p.id AS post_id, p.user_id, p.category_id, p.post_type, p.title, p.description, p.location, p.incident_date, p.status,
      u.name AS owner_name
     FROM matches m
     INNER JOIN posts p
      ON p.id = CASE WHEN m.lost_post_id = ? THEN m.found_post_id ELSE m.lost_post_id END
     INNER JOIN users u ON u.id = p.user_id
     WHERE m.lost_post_id = ? OR m.found_post_id = ?
     ORDER BY m.score DESC, m.created_at DESC`,
    [postId, postId, postId]
  );

  return rows;
};
