// const transporter = require('../config/mailer');

// const EMAIL_FOOTER = '<p style="color:#6b7280;font-size:13px;">Không muốn nhận email? Liên hệ admin.</p>';

// sendMail.js

const EMAIL_FOOTER =
  '<p style="color:#6b7280;font-size:13px;">Không muốn nhận email? Liên hệ admin.</p>';

async function sendEmail({ to, subject, html }) {
  console.log('\n=================================');
  console.log('📧 MOCK EMAIL');
  console.log('=================================');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:');
  console.log(`${html}${EMAIL_FOOTER}`);
  console.log('=================================\n');

  return true;
}

function sendNewMessageEmail(receiverEmail, senderName, clientUrl) {
  const subject = `[Lost & Found] Bạn có tin nhắn mới từ ${senderName}`;

  const html = `
    <h3>Bạn có tin nhắn mới</h3>
    <p>${senderName} vừa gửi tin nhắn cho bạn trong hệ thống Lost & Found.</p>
    <p><a href="${clientUrl}/chat">Xem tin nhắn</a></p>
  `;

  return sendEmail({
    to: receiverEmail,
    subject,
    html,
  });
}

function sendNewMatchEmail(
  ownerEmail,
  postTitle,
  matchPostTitle,
  postId,
  clientUrl
) {
  const subject =
    '[Lost & Found] Hệ thống tìm thấy bài đăng có thể khớp với bạn!';

  const html = `
    <h3>Hệ thống tìm thấy bài đăng có thể khớp</h3>
    <p>Bài đăng của bạn: <strong>${postTitle}</strong></p>
    <p>Bài đăng có thể khớp: <strong>${matchPostTitle}</strong></p>
    <p><a href="${clientUrl}/posts/${postId}">Xem ngay</a></p>
  `;

  return sendEmail({
    to: ownerEmail,
    subject,
    html,
  });
}

module.exports = {
  sendEmail,
  sendNewMessageEmail,
  sendNewMatchEmail,
};