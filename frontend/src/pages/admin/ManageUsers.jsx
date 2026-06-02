import { useEffect, useMemo, useState } from 'react';
import { MagnifyingGlass, Lock, LockOpen, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/formatDate.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';

const PAGE_SIZE = 20;

export default function ManageUsers() {
  useDocumentTitle('Admin · Người dùng');
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    adminService
      .getAllUsers(params)
      .then((res) => {
        if (!mounted) return;
        const items = res?.data?.items || res?.data || res?.items || [];
        setUsers(Array.isArray(items) ? items : []);
        setTotal(res?.data?.total ?? res?.total ?? (Array.isArray(items) ? items.length : 0));
      })
      .catch((e) => mounted && setError(e?.message || 'Không tải được người dùng'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [search, page]);

  const handleToggleLock = async (user) => {
    const id = user.id;
    const willLock = !user.locked;
    if (!window.confirm(willLock ? `Khóa tài khoản ${user.name}?` : `Mở khóa tài khoản ${user.name}?`)) return;
    const prev = users;
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, locked: willLock } : u)));
    setBusyId(id);
    try {
      await adminService.toggleLockUser(id);
      toast.success(willLock ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
    } catch (e) {
      setUsers(prev);
      toast.error(e?.message || 'Thao tác thất bại');
    } finally { setBusyId(null); }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900">Quản lý người dùng</h1>
        <span className="text-xs text-gray-500 font-mono">{total} người dùng</span>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <label className="relative block">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Tìm theo tên hoặc email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
          />
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">ID</th>
                <th className="px-4 py-2.5 text-left font-medium">Tên</th>
                <th className="px-4 py-2.5 text-left font-medium">Email</th>
                <th className="px-4 py-2.5 text-left font-medium">Ngày đăng ký</th>
                <th className="px-4 py-2.5 text-left font-medium">Số bài đăng</th>
                <th className="px-4 py-2.5 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-2.5 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : error ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-red-600">{error}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">Không có người dùng nào.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${u.locked ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">#{u.id}</td>
                    <td className="px-4 py-2.5 text-gray-900">{u.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{u.email}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{u.created_at ? formatDate(u.created_at) : u.createdAt ? formatDate(u.createdAt) : ''}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-700">{u.post_count ?? u.postCount ?? 0}</td>
                    <td className="px-4 py-2.5">
                      {u.locked ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">Đã khóa</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Hoạt động</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => handleToggleLock(u)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border disabled:opacity-50 ${
                          u.locked
                            ? 'border-green-200 text-green-700 hover:bg-green-50'
                            : 'border-red-200 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        {u.locked ? <LockOpen size={14} weight="light" /> : <Lock size={14} weight="light" />}
                        {u.locked ? 'Mở khóa' : 'Khóa'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-mono">Trang {page} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                <CaretLeft size={14} />
              </button>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                <CaretRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
