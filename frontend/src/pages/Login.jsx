import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Login() {
  useDocumentTitle('Đăng nhập');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid md:grid-cols-2">
      {/* Left: illustration (desktop only) */}
      <aside className="hidden md:block relative overflow-hidden">
        <img
          src="https://picsum.photos/seed/campus/800/600"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-accent/40 mix-blend-multiply" />
        <div className="relative h-full flex flex-col justify-end p-10 text-white">
          <h2 className="text-2xl font-semibold leading-snug max-w-md">
            Giúp bạn tìm lại đồ thất lạc trong khuôn viên trường.
          </h2>
          <p className="text-sm text-white/80 mt-2 max-w-md">
            Kết nối sinh viên mất đồ và sinh viên nhặt được đồ — nhanh, đơn giản, an toàn.
          </p>
        </div>
      </aside>

      {/* Right: form */}
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Đăng nhập</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chào mừng bạn quay lại Student Lost &amp; Found.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email sinh viên
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
                placeholder="ten.sv@university.edu.vn"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  aria-label={showPwd ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPwd ? (
                    <EyeSlash size={18} weight="light" />
                  ) : (
                    <Eye size={18} weight="light" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-status-lost bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading && <CircleNotch size={16} weight="light" className="animate-spin" />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium">
              Đăng ký
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
