import { useState } from 'react';
import { X } from '@phosphor-icons/react';
import { authService } from '../../services/authService.js';

export default function RegisterModal({ onClose, onOpenLogin }) {
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      await authService.register(values.name, values.email, values.password);
      onClose();
      onOpenLogin();
    } catch (err) {
      setError(err?.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    onClose();
    onOpenLogin();
  };

  return (
    <div className="auth-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="auth-modal-close" aria-label="Đóng" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="auth-modal-header">
          <h2 id="register-modal-title">Đăng ký</h2>
          <p>Tạo tài khoản để đăng tin mất đồ và theo dõi bài đăng của bạn.</p>
        </div>

        <div className="auth-modal-fields">
          <Field
            id="register-name"
            label="Họ tên"
            value={values.name}
            onChange={(value) => updateField('name', value)}
            autoComplete="name"
            placeholder="Nguyễn Minh Khôi"
          />
          <Field
            id="register-email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(value) => updateField('email', value)}
            autoComplete="email"
            placeholder="ten.sv@university.edu.vn"
          />
          <Field
            id="register-password"
            label="Mật khẩu"
            type="password"
            value={values.password}
            onChange={(value) => updateField('password', value)}
            autoComplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
          />
        </div>

        <button
          type="button"
          className="btn auth-submit-btn mt-3"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>

        {error && <p className="auth-error">{error}</p>}

        <p className="auth-switch-text">
          Đã có tài khoản?{' '}
          <button type="button" className="auth-text-btn" onClick={switchToLogin}>
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, type = 'text', ...props }) {
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
