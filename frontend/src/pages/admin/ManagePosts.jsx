import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Trash, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/formatDate.js';
import Badge from '../../components/common/Badge.jsx';
import { POST_TYPE, POST_STATUS } from '../../utils/constants.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';

const PAGE_SIZE = 20;

export default function ManagePosts() {
  useDocumentTitle('Admin · Bài đăng');
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (type) params.type = type;
    if (status) params.status = status;
    adminService
      .getAllPosts(params)
      .then((res) => {
        if (!mounted) return;
        const items = res?.data?.items || res?.data || res?.items || [];
        setPosts(Array.isArray(items) ? items : []);
        setTotal(res?.data?.total ?? res?.total ?? (Array.isArray(items) ? items.length : 0));
      })
      .catch((e) => mounted && setError(e?.message || 'Không tải được bài đăng'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [search, type, status, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài đăng này? Hành động không thể hoàn tác.')) return;
    setBusyId(id);
    try {
      await adminService.deletePost(id);
      setPosts((list) => list.filter((p) => p.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success('Đã xóa bài đăng');
    } catch (e) {
      toast.error(e?.message || 'Xóa thất bại');
    } finally { setBusyId(null); }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900">Quản lý bài đăng</h1>
        <span className="text-xs text-gray-500 font-mono">{total} bài</span>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2">
        <label className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            placeholder="Tìm theo tiêu đề..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent"
          />
        </label>
        <select value={type} onChange={(e) => { setPage(1); setType(e.target.value); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent">
          <option value="">Tất cả loại</option>
          <option value={POST_TYPE.LOST}>Mất đồ</option>
          <option value={POST_TYPE.FOUND}>Nhặt được</option>
        </select>
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-accent">
          <option value="">Tất cả trạng thái</option>
          <option value={POST_STATUS.SEARCHING}>Đang tìm</option>
          <option value={POST_STATUS.RESOLVED}>Đã tìm thấy</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">ID</th>
                <th className="px-4 py-2.5 text-left font-medium">Tiêu đề</th>
                <th className="px-4 py-2.5 text-left font-medium">Loại</th>
                <th className="px-4 py-2.5 text-left font-medium">Danh mục</th>
                <th className="px-4 py-2.5 text-left font-medium">Người đăng</th>
                <th className="px-4 py-2.5 text-left font-medium">Ngày</th>
                <th className="px-4 py-2.5 text-left font-medium">Trạng thái</th>
                <th className="px-4 py-2.5 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : error ? (
                <tr><td colSpan={8} className="px-4 py-6 text-center text-red-600">{error}</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">Không có bài đăng nào.</td></tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400">#{p.id}</td>
                    <td className="px-4 py-2.5">
                      <Link to={`/posts/${p.id}`} className="text-gray-900 hover:text-accent line-clamp-1">{p.title}</Link>
                    </td>
                    <td className="px-4 py-2.5"><Badge type={p.type} /></td>
                    <td className="px-4 py-2.5 text-gray-600">{p.category || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600 truncate max-w-[160px]">{p.user?.name || p.userName || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{p.date ? formatDate(p.date) : ''}</td>
                    <td className="px-4 py-2.5"><Badge status={p.status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <button type="button" disabled={busyId === p.id} onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50">
                        <Trash size={14} weight="light" /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && posts.length > 0 && (
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
