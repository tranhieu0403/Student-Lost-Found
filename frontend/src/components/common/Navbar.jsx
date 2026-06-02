import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  MagnifyingGlass,
  House,
  PlusCircle,
  ChatCircle,
  User,
  CaretDown,
  SignOut,
  Notebook,
} from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth.js';

const ICON = 20;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <>
      <DesktopNav user={user} isAuthenticated={isAuthenticated} onLogout={logout} />
      <MobileTopBar user={user} isAuthenticated={isAuthenticated} />
      <MobileBottomNav isAuthenticated={isAuthenticated} />
    </>
  );
}

function DesktopNav({ user, isAuthenticated, onLogout }) {
  return (
    <nav className="hidden md:block sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Brand />
        <div className="flex items-center gap-1">
          <TopLink to="/" exact>Trang chủ</TopLink>
          {isAuthenticated && <TopLink to="/posts/create">Đăng bài</TopLink>}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <UserMenu user={user} onLogout={onLogout} />
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-sm bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg font-medium active:scale-[0.98]"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 text-gray-900">
      <MagnifyingGlass size={ICON} weight="light" className="text-accent" />
      <span className="font-semibold tracking-tight">Lost &amp; Found</span>
    </Link>
  );
}

function TopLink({ to, exact, children }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `text-sm px-3 py-1.5 rounded-lg ${
          isActive ? 'text-accent bg-accent-light' : 'text-gray-700 hover:bg-gray-50'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50"
      >
        <Avatar name={user?.name} />
        <span className="text-sm text-gray-700">{user?.name || 'Tài khoản'}</span>
        <CaretDown size={14} weight="light" className="text-gray-400" />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-card py-1">
          <li>
            <Link
              to="/my-posts"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Notebook size={16} weight="light" />
              Bài của tôi
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-status-lost hover:bg-red-50"
            >
              <SignOut size={16} weight="light" />
              Đăng xuất
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

function Avatar({ name }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <span className="w-8 h-8 rounded-full bg-accent-light text-accent text-sm font-medium flex items-center justify-center">
      {initial}
    </span>
  );
}

function MobileTopBar({ user, isAuthenticated }) {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="px-4 h-12 flex items-center justify-between">
        <Brand />
        {isAuthenticated ? (
          <Avatar name={user?.name} />
        ) : (
          <Link to="/login" className="text-sm text-accent font-medium">
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}

function MobileBottomNav({ isAuthenticated }) {
  const profilePath = isAuthenticated ? '/my-posts' : '/login';
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100">
      <ul className="grid grid-cols-4 h-14">
        <BottomTab to="/" icon={House} label="Trang chủ" exact />
        <BottomTab to="/posts/create" icon={PlusCircle} label="Đăng" />
        <BottomTab to="/chat" icon={ChatCircle} label="Tin nhắn" />
        <BottomTab to={profilePath} icon={User} label="Cá nhân" />
      </ul>
    </nav>
  );
}

function BottomTab({ to, icon: Icon, label, exact }) {
  return (
    <li>
      <NavLink
        to={to}
        end={exact}
        className={({ isActive }) =>
          `h-full flex flex-col items-center justify-center gap-0.5 text-[11px] ${
            isActive ? 'text-accent' : 'text-gray-400'
          }`
        }
      >
        <Icon size={22} weight="light" />
        {label}
      </NavLink>
    </li>
  );
}
