import { useState } from 'react';
import { X } from '@phosphor-icons/react';

export default function LoginModal({ onClose, onLogin, onOpenRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      await onLogin(email, password);
      onClose();
    } catch (err) {
      setError(err?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    onClose();
    onOpenRegister();
  };

  return (
    <div className="auth-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-modal-close" aria-label="Đóng" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-modal-header">
          <h2 id="login-modal-title">Đăng nhập</h2>
          <p>Tiếp tục tìm kiếm và quản lý bài đăng thất lạc của bạn.</p>
        </div>

        <div className="auth-modal-fields">
          <Field
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            placeholder="ten.sv@university.edu.vn"
          />
          <Field
            id="login-password"
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
          />
        </div>

        <div className="d-flex justify-content-end mb-3">
          <button type="button" className="auth-text-btn">
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="button"
          className="btn auth-submit-btn"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-switch-text">
          Chưa có tài khoản?{' '}
          <button type="button" className="auth-text-btn" onClick={switchToRegister}>
            Đăng ký
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type, ...props }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="form-control auth-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </div>
  );
}
