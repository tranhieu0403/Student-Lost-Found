import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ChartBar, Article, Users, ShieldCheck, List, X } from '@phosphor-icons/react';

const NAV = [
  { to: '/admin/dashboard', end: true, label: 'Dashboard', icon: ChartBar },
  { to: '/admin/posts', label: 'Bài đăng', icon: Article },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
];

function SidebarNav({ onNavigate }) {
  return (
    <nav className="flex-1 p-3 space-y-1">
      {NAV.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-accent-light text-accent-hover border-l-2 border-accent'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Icon size={18} weight="light" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarHeader() {
  return (
    <div className="h-14 px-5 flex items-center gap-2 border-b border-gray-100">
      <span className="w-8 h-8 rounded-lg bg-accent-light text-accent-hover flex items-center justify-center">
        <ShieldCheck size={18} weight="fill" />
      </span>
      <span className="text-sm font-semibold text-gray-900">Admin Panel</span>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Đóng drawer mỗi khi đổi route
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)]">
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-gray-200 bg-white">
        <SidebarHeader />
        <SidebarNav />
      </aside>

      <section className="flex-1 min-w-0 bg-bg-base">
        <div className="md:hidden flex items-center gap-2 px-4 h-12 bg-white border-b border-gray-200">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-gray-700 hover:bg-gray-50"
            aria-label="Mở menu admin"
          >
            <List size={20} weight="light" />
          </button>
          <span className="text-sm font-semibold text-gray-900">Admin Panel</span>
        </div>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </section>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white flex flex-col shadow-card-hover">
            <div className="h-14 px-5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-accent-light text-accent-hover flex items-center justify-center">
                  <ShieldCheck size={18} weight="fill" />
                </span>
                <span className="text-sm font-semibold text-gray-900">Admin Panel</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 -mr-1.5 text-gray-500 hover:text-gray-700"
                aria-label="Đóng menu"
              >
                <X size={18} weight="light" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  );
}
