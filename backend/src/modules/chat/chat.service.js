const { pool } = require('../../config/db');
const notificationService = require('../notifications/notification.service');

exports.getConversations = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
      IF(m.sender_id = ?, m.receiver_id, m.sender_id) AS partner_id,
      u.name AS partner_name,
      MAX(m.created_at) AS last_message_at,
      SUBSTRING_INDEX(
        GROUP_CONCAT(m.content ORDER BY m.created_at DESC SEPARATOR '|||'),
        '|||',
        1
      ) AS last_message,
      SUM(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 ELSE 0 END) AS unread_count
     FROM messages m
     INNER JOIN users u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
     WHERE m.sender_id = ? OR m.receiver_id = ?
     GROUP BY partner_id, u.name
     ORDER BY last_message_at DESC`,
    [userId, userId, userId, userId, userId]
  );

  return rows;
};

exports.getMessages = async (userId, otherUserId, page = 1, limit = 20) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const offset = (normalizedPage - 1) * normalizedLimit;

  const [messages] = await pool.query(
    `SELECT id, sender_id, receiver_id, post_id, content, is_read, created_at
     FROM messages
     WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
     ORDER BY created_at ASC
     LIMIT ? OFFSET ?`,
    [userId, otherUserId, otherUserId, userId, normalizedLimit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(id) AS total
     FROM messages
     WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
    [userId, otherUserId, otherUserId, userId]
  );

  return {
    messages,
    total: countRows[0].total,
    page: normalizedPage,
  };
};

exports.sendMessage = async (senderId, receiverId, content, postId) => {
  const [receivers] = await pool.query('SELECT id FROM users WHERE id = ? LIMIT 1', [receiverId]);
  if (receivers.length === 0) {
    const err = new Error('Không tìm thấy người nhận');
    err.status = 404;
    err.code = 'RECEIVER_NOT_FOUND';
    throw err;
  }

  const [firstMessageRows] = await pool.query(
    `SELECT COUNT(id) AS total
     FROM messages
     WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
    [senderId, receiverId, receiverId, senderId]
  );
  const isFirstConversationMessage = Number(firstMessageRows[0].total) === 0;

  const [result] = await pool.query(
    'INSERT INTO messages (sender_id, receiver_id, post_id, content, is_read) VALUES (?, ?, ?, ?, 0)',
    [senderId, receiverId, postId || null, content]
  );

  if (isFirstConversationMessage) {
    const [senders] = await pool.query('SELECT name FROM users WHERE id = ? LIMIT 1', [senderId]);
    const senderName = senders[0]?.name || 'Người dùng';
    void notificationService.sendNewMessageNotification({ receiverId, senderName });
  }

  const [messages] = await pool.query(
    `SELECT id, sender_id, receiver_id, post_id, content, is_read, created_at
     FROM messages WHERE id = ? LIMIT 1`,
    [result.insertId]
  );
  return messages[0];
};

exports.markAsRead = async (userId, otherUserId) => {
  const [result] = await pool.query(
    `UPDATE messages
     SET is_read = 1
     WHERE receiver_id = ? AND sender_id = ? AND is_read = 0`,
    [userId, otherUserId]
  );

  return { updated: result.affectedRows };
};
