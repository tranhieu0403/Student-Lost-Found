import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Key,
  EnvelopeSimple,
  CircleNotch,
} from '@phosphor-icons/react';
import { authService } from '../services/authService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function ForgotPassword() {
  useDocumentTitle('Quên mật khẩu');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra, thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <EnvelopeSimple size={32} weight="light" className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Kiểm tra email của bạn</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <br />
            <strong className="text-gray-700">{email}</strong>
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Không thấy email? Kiểm tra thư mục Spam hoặc{' '}
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setError('');
              }}
              className="text-accent hover:text-accent-hover font-medium"
            >
              thử lại
            </button>
          </p>
          <Link to="/login" className="text-sm text-accent hover:text-accent-hover font-medium">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 w-fit"
        >
          <ArrowLeft size={16} weight="light" /> Quay lại đăng nhập
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-5">
            <Key size={24} weight="light" className="text-accent" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900">Quên mật khẩu?</h1>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">
            Nhập email sinh viên của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email sinh viên
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten.sv@university.edu.vn"
                className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <CircleNotch size={16} weight="light" className="animate-spin" />}
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
