import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  ChatCircle,
  List,
  MagnifyingGlass,
  Notebook,
  SignOut,
} from '@phosphor-icons/react';
import { useAuth } from '../../hooks/useAuth.js';
import chatService from '../../services/chatService.js';
import { getSocket } from '../../hooks/useChat.js';
// Using page routes for login/register instead of modal dialogs

export default function Navbar() {
  const { user, loading, login, logout } = useAuth();
  const isLoggedIn = !loading && user !== null;
  const [unreadMessages, setUnreadMessages] = useState(0);
  const token = localStorage.getItem('token');

  const refreshBadge = async () => {
    try {
      const res = await chatService.getConversations();
      const conversations = res?.data || res || [];
      const total = conversations.reduce(
        (sum, conv) => sum + (conv.unread_count || 0),
        0,
      );
      setUnreadMessages(total);
    } catch {
      setUnreadMessages(0);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!isLoggedIn) {
      setUnreadMessages(0);
      return () => {
        mounted = false;
      };
    }

    refreshBadge();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const socket = getSocket(token);
    socket.on('new_message', refreshBadge);
    socket.on('conversation_updated', refreshBadge);
    socket.on('messages_read', refreshBadge);

    return () => {
      socket.off('new_message', refreshBadge);
      socket.off('conversation_updated', refreshBadge);
      socket.off('messages_read', refreshBadge);
    };
  }, [isLoggedIn, token]);

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
        {unreadMessages > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill alert-badge">
            {unreadMessages > 99 ? '99+' : unreadMessages}
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
