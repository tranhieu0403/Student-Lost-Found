// HTML template cho email gửi từ hệ thống (inline style cho tương thích email client)

function resetPasswordEmailTemplate({ name, resetUrl }) {
  return `
    <div style="font-family:Outfit,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:600;">Xin chào ${name},</h2>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
        Nhấn vào nút bên dưới để tạo mật khẩu mới:
      </p>
      <p style="margin:0 0 24px;">
        <a href="${resetUrl}"
           style="background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">
          Đặt lại mật khẩu
        </a>
      </p>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
        Link có hiệu lực trong 1 giờ.
      </p>
      <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">
        Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="margin:0;font-size:12px;color:#9ca3af;">© Student Lost & Found</p>
    </div>
  `;
}

module.exports = {
  resetPasswordEmailTemplate,
};
