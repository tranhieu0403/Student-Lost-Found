const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const EMAIL_FOOTER = `
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
  <p style="color:#9ca3af;font-size:12px;text-align:center;">
    © Student Lost & Found<br/>
    Không muốn nhận email? Liên hệ
    <a href="mailto:admin@lostfound.edu.vn" style="color:#0d9488;">
      admin@lostfound.edu.vn
    </a>
  </p>
`;

async function sendEmail({ to, subject, html }) {
  // Fallback mock khi chưa cấu hình AWS credentials (dev local)
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('\n=================================');
    console.log('📧 MOCK EMAIL (no AWS credentials)');
    console.log('=================================');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('=================================\n');
    return true;
  }

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `${html}${EMAIL_FOOTER}`,
          Charset: 'UTF-8',
        },
      },
    },
  });

  try {
    await sesClient.send(command);
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    // Log lỗi nhưng KHÔNG throw — email lỗi không được làm hỏng logic chính
    console.error(`❌ SES error sending to ${to}:`, err.message);
    return false;
  }
}

function sendNewMessageEmail(receiverEmail, senderName, clientUrl) {
  const subject = `[Lost & Found] Bạn có tin nhắn mới từ ${senderName}`;
  const html = `
    <div style="font-family:'Outfit',Arial,sans-serif;max-width:480px;margin:0 auto;
                background:#fff;border:1px solid #e5e7eb;border-radius:12px;
                overflow:hidden;">
      <div style="background:#0d9488;padding:24px;text-align:center;">
        <h2 style="color:white;margin:0;font-size:18px;">💬 Tin nhắn mới</h2>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;margin:0 0 12px;">
          <strong>${senderName}</strong> vừa gửi tin nhắn cho bạn.
        </p>
        <a href="${clientUrl}/chat"
           style="display:inline-block;background:#0d9488;color:white;
                  padding:10px 20px;border-radius:8px;text-decoration:none;
                  font-weight:600;font-size:14px;">
          Xem tin nhắn →
        </a>
      </div>
    </div>
  `;
  return sendEmail({ to: receiverEmail, subject, html });
}

function sendNewMatchEmail(ownerEmail, postTitle, matchPostTitle, postId, clientUrl) {
  const subject = '[Lost & Found] Hệ thống tìm thấy bài đăng có thể khớp!';
  const html = `
    <div style="font-family:'Outfit',Arial,sans-serif;max-width:480px;margin:0 auto;
                background:#fff;border:1px solid #e5e7eb;border-radius:12px;
                overflow:hidden;">
      <div style="background:#0d9488;padding:24px;text-align:center;">
        <h2 style="color:white;margin:0;font-size:18px;">🔍 Tìm thấy bài khớp</h2>
      </div>
      <div style="padding:24px;">
        <p style="color:#6b7280;margin:0 0 8px;font-size:13px;">Bài đăng của bạn:</p>
        <p style="color:#111827;font-weight:600;margin:0 0 16px;">${postTitle}</p>
        <p style="color:#6b7280;margin:0 0 8px;font-size:13px;">Bài đăng có thể khớp:</p>
        <p style="color:#111827;font-weight:600;margin:0 0 20px;">${matchPostTitle}</p>
        <a href="${clientUrl}/posts/${postId}"
           style="display:inline-block;background:#0d9488;color:white;
                  padding:10px 20px;border-radius:8px;text-decoration:none;
                  font-weight:600;font-size:14px;">
          Xem ngay →
        </a>
      </div>
    </div>
  `;
  return sendEmail({ to: ownerEmail, subject, html });
}

function sendResetPasswordEmail(receiverEmail, receiverName, resetUrl) {
  const subject = '[Lost & Found] Đặt lại mật khẩu của bạn';
  const html = `
    <div style="font-family:'Outfit',Arial,sans-serif;max-width:480px;margin:0 auto;
                background:#fff;border:1px solid #e5e7eb;border-radius:12px;
                overflow:hidden;">
      <div style="background:#0d9488;padding:24px;text-align:center;">
        <h2 style="color:white;margin:0;font-size:18px;">🔑 Đặt lại mật khẩu</h2>
      </div>
      <div style="padding:24px;">
        <p style="color:#374151;margin:0 0 8px;">
          Xin chào <strong>${receiverName}</strong>,
        </p>
        <p style="color:#6b7280;margin:0 0 20px;line-height:1.6;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
          Click vào nút bên dưới để tiếp tục.
        </p>
        <div style="text-align:center;margin-bottom:20px;">
          <a href="${resetUrl}"
             style="display:inline-block;background:#0d9488;color:white;
                    padding:12px 28px;border-radius:8px;text-decoration:none;
                    font-weight:600;font-size:15px;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          Link có hiệu lực trong <strong>1 giờ</strong>.<br/>
          Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.
        </p>
        <p style="color:#9ca3af;font-size:11px;text-align:center;
                  margin-top:12px;word-break:break-all;">
          Hoặc copy link: ${resetUrl}
        </p>
      </div>
    </div>
  `;
  return sendEmail({ to: receiverEmail, subject, html });
}

module.exports = {
  sendEmail,
  sendNewMessageEmail,
  sendNewMatchEmail,
  sendResetPasswordEmail,
};