const { pool } = require('../../config/db');
const { sendNewMatchEmail, sendNewMessageEmail } = require('../../utils/sendEmail');

async function createNotification(userId, type, content, relatedId) {
  await pool.query(
    'INSERT INTO notifications (user_id, type, content, related_id) VALUES (?, ?, ?, ?)',
    [userId, type, content, relatedId || null]
  );
}

exports.sendNewMatchNotification = async ({ ownerId, postId, postTitle, matchPostTitle }) => {
  try {
    await createNotification(
      ownerId,
      'new_match',
      `Bài đăng "${postTitle}" có thể khớp với "${matchPostTitle}"`,
      postId
    );

    const [users] = await pool.query('SELECT email FROM users WHERE id = ? LIMIT 1', [ownerId]);
    const email = users[0]?.email;
    if (email) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      void sendNewMatchEmail(email, postTitle, matchPostTitle, postId, clientUrl);
    }
  } catch (error) {
    console.error('Failed to send match notification:', error.message);
  }
};

exports.sendNewMessageNotification = async ({ receiverId, senderName }) => {
  try {
    await createNotification(
      receiverId,
      'new_message',
      `Bạn có tin nhắn mới từ ${senderName}`,
      null
    );

    const [users] = await pool.query('SELECT email FROM users WHERE id = ? LIMIT 1', [receiverId]);
    const email = users[0]?.email;
    if (email) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      void sendNewMessageEmail(email, senderName, clientUrl);
    }
  } catch (error) {
    console.error('Failed to send message notification:', error.message);
  }
};
