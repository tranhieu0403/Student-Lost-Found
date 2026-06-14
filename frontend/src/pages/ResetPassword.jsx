import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LockKey,
  Eye,
  EyeSlash,
  WarningCircle,
  CheckCircle,
  CircleNotch,
} from '@phosphor-icons/react';
import { authService } from '../services/authService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function ResetPassword() {
  useDocumentTitle('Đặt lại mật khẩu');
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await authService.verifyResetToken(token);
        if (!cancelled) setTokenValid(true);
      } catch {
        if (!cancelled) setTokenValid(false);
      } finally {
        if (!cancelled) setCheckingToken(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!success) return undefined;
    // Trigger transform animation sau khi paint xong frame đầu
    const raf = requestAnimationFrame(() => setProgress(1));
    const t = setTimeout(() => navigate('/login'), 3000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || 'Link đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
        <CircleNotch size={32} weight="light" className="text-accent animate-spin" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <WarningCircle size={32} weight="light" className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Link đã hết hạn hoặc không hợp lệ
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            Vui lòng yêu cầu link đặt lại mật khẩu mới.
          </p>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-lg active:scale-[0.98]"
          >
            Yêu cầu link mới
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} weight="light" className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Mật khẩu đã được cập nhật!
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-5">
            Đang chuyển hướng về đăng nhập...
          </p>
          <div className="h-1 bg-teal-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-accent origin-left transition-transform ease-linear"
              style={{ transform: `scaleX(${progress})`, transitionDuration: '3000ms' }}
            />
          </div>
        </div>
      </div>
    );
  }

  const showPasswordError = password.length > 0 && password.length < 8;
  const showMismatchError =
    confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-5">
            <LockKey size={24} weight="light" className="text-accent" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900">Đặt lại mật khẩu</h1>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              id="new-password"
              label="Mật khẩu mới"
              value={password}
              onChange={setPassword}
              show={showPwd}
              onToggle={() => setShowPwd((v) => !v)}
              autoComplete="new-password"
              helper={
                showPasswordError
                  ? 'Mật khẩu phải có ít nhất 8 ký tự'
                  : 'Tối thiểu 8 ký tự'
              }
              helperTone={showPasswordError ? 'error' : 'muted'}
            />

            <PasswordField
              id="confirm-password"
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              autoComplete="new-password"
              helper={showMismatchError ? 'Mật khẩu xác nhận không khớp' : ''}
              helperTone="error"
            />

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2.5 rounded-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <CircleNotch size={16} weight="light" className="animate-spin" />}
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  helper,
  helperTone = 'muted',
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {show ? <EyeSlash size={18} weight="light" /> : <Eye size={18} weight="light" />}
        </button>
      </div>
      {helper && (
        <p
          className={`mt-1.5 text-xs ${
            helperTone === 'error' ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {helper}
        </p>
      )}
    </div>
  );
}
