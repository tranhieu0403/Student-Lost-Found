import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ChatCircle,
  List,
  MagnifyingGlass,
  Notebook,
  SignOut,
} from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth.js';
// Using page routes for login/register instead of modal dialogs

const UNREAD_MESSAGES = 3;

export default function Navbar() {
  const { user, loading, login, logout } = useAuth();
  const isLoggedIn = !loading && user !== null;

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top home-navbar">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center gap-2 fw-semibold" to="/">
            <span className="brand-icon">
              <MagnifyingGlass size={20} weight="bold" />
            </span>
            Lost &amp; Found
          </Link>

          {isLoggedIn && (
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#homeNavbar"
              aria-controls="homeNavbar"
              aria-expanded="false"
              aria-label="Mở menu"
            >
              <List size={24} />
            </button>
          )}

          <div className={`${isLoggedIn ? 'collapse navbar-collapse' : 'd-flex flex-grow-1 justify-content-end'}`} id="homeNavbar">
            {isLoggedIn && (
              <ul className="navbar-nav mx-lg-auto gap-lg-2 mt-3 mt-lg-0">
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link home-nav-link ${isActive ? 'active' : ''}`} to="/" end>
                    Trang chủ
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link home-nav-link ${isActive ? 'active' : ''}`} to="/posts/create">
                    Đăng bài
                  </NavLink>
                </li>
              </ul>
            )}

            <div className="d-flex align-items-center gap-2 mt-0">
              {loading ? (
                <AuthLoadingPlaceholder />
              ) : isLoggedIn ? (
                <LoggedInActions user={user} onLogout={logout} />
              ) : (
                <GuestActions />
              )}
            </div>
          </div>
        </div>
      </nav>

    </>
  );
}

function AuthLoadingPlaceholder() {
  return (
    <div className="auth-nav-placeholder" aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

function GuestActions() {
  return (
    <div className="d-flex align-items-center gap-2">
      <Link to="/login" className="btn auth-ghost-btn">
        Đăng nhập
      </Link>
      <Link to="/register" className="btn auth-primary-btn">
        Đăng ký
      </Link>
    </div>
  );
}

function LoggedInActions({ user, onLogout }) {
  return (
    <>
      <Link className="btn icon-btn position-relative" to="/chat" aria-label="Tin nhắn">
        <ChatCircle className="ti-message-circle" size={22} />
        {UNREAD_MESSAGES > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill alert-badge">
            {UNREAD_MESSAGES}
          </span>
        )}
      </Link>

      <div className="dropdown">
        <button
          className="btn user-menu-btn dropdown-toggle d-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span className="avatar-circle">{getInitials(user?.name)}</span>
          <span className="d-none d-sm-inline">{user?.name || 'Tài khoản'}</span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3 mt-2">
          <li>
            <Link className="dropdown-item d-flex align-items-center gap-2" to="/my-posts">
              <Notebook size={18} />
              Bài của tôi
            </Link>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button
              className="dropdown-item d-flex align-items-center gap-2 text-danger"
              type="button"
              onClick={onLogout}
            >
              <SignOut size={18} />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] || 'U').slice(0, 2).toUpperCase();
}
