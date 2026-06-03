import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';
import { authService } from '../services/authService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const INITIAL = { name: '', email: '', password: '', confirm: '' };

function validateField(name, value, all) {
  switch (name) {
    case 'name':
      return value.trim().length === 0 ? 'Vui lòng nhập họ và tên' : '';
    case 'email':
      if (!value) return 'Vui lòng nhập email';
      if (!value.includes('@')) return 'Email không hợp lệ';
      return '';
    case 'password':
      return value.length < 8 ? 'Mật khẩu phải có ít nhất 8 ký tự' : '';
    case 'confirm':
      if (!value) return 'Vui lòng xác nhận mật khẩu';
      return value !== all.password ? 'Mật khẩu xác nhận không khớp' : '';
    default:
      return '';
  }
}

export default function Register() {
  useDocumentTitle('Đăng ký');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const setField = (k) => (e) => {
    const v = e.target.value;
    setValues((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) {
      setErrors((prev) => ({ ...prev, [k]: validateField(k, v, { ...values, [k]: v }) }));
    }
  };

  const handleBlur = (k) => () => {
    setErrors((prev) => ({ ...prev, [k]: validateField(k, values[k], values) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const nextErrors = {};
    Object.keys(INITIAL).forEach((k) => {
      const err = validateField(k, values[k], values);
      if (err) nextErrors[k] = err;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError('');
    setLoading(true);
    try {
      await authService.register(values.name, values.email, values.password);
      // Automatically log the user in after successful registration
      await login(values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError(err?.message || 'Không thể tạo tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2">
      {/* Left: form */}
      <section className="flex items-center justify-center px-6 py-10 order-2 md:order-1">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Tạo tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tham gia cộng đồng tìm lại đồ thất lạc cùng sinh viên trường bạn.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <Field
              id="name"
              label="Họ và tên"
              value={values.name}
              onChange={setField('name')}
              onBlur={handleBlur('name')}
              error={errors.name}
              autoComplete="name"
              placeholder="Nguyễn Văn A"
            />
            <Field
              id="email"
              type="email"
              label="Email sinh viên"
              value={values.email}
              onChange={setField('email')}
              onBlur={handleBlur('email')}
              error={errors.email}
              autoComplete="email"
              placeholder="ten.sv@university.edu.vn"
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={values.password}
                  onChange={setField('password')}
                  onBlur={handleBlur('password')}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  className={`w-full text-sm bg-white border rounded-lg px-3 py-2.5 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-status-lost focus:ring-red-500/30 focus:border-status-lost'
                      : 'border-gray-200 focus:ring-teal-500/30 focus:border-accent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPwd ? <EyeSlash size={18} weight="light" /> : <Eye size={18} weight="light" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-status-lost">{errors.password}</p>}
            </div>

            <Field
              id="confirm"
              type={showPwd ? 'text' : 'password'}
              label="Xác nhận mật khẩu"
              value={values.confirm}
              onChange={setField('confirm')}
              onBlur={handleBlur('confirm')}
              error={errors.confirm}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
            />

            {submitError && (
              <p className="text-xs text-status-lost bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <CircleNotch size={16} weight="light" className="animate-spin" />}
              {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
              Đăng nhập
            </Link>
          </p>
        </div>
      </section>

      {/* Right: illustration */}
      <aside className="hidden md:block relative overflow-hidden order-1 md:order-2">
        <img
          src="https://picsum.photos/seed/campus-register/800/600"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-accent/40 mix-blend-multiply" />
        <div className="relative h-full flex flex-col justify-end p-10 text-white">
          <h2 className="text-2xl font-semibold leading-snug max-w-md">
            Một tài khoản, hai vai trò: người mất và người nhặt.
          </h2>
          <p className="text-sm text-white/80 mt-2 max-w-md">
            Đăng tin trong vài giây, nhận thông báo khi có ai đó liên hệ với bạn.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Field({ id, label, error, type = 'text', ...rest }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...rest}
        className={`text-sm bg-white border rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
          error
            ? 'border-status-lost focus:ring-red-500/30 focus:border-status-lost'
            : 'border-gray-200 focus:ring-teal-500/30 focus:border-accent'
        }`}
      />
      {error && <p className="text-xs text-status-lost">{error}</p>}
    </div>
  );
}
