import { useCallback, useEffect, useMemo, useState } from 'react';
import { Article, Eye, Trash } from '@phosphor-icons/react';
import adminService from '../../services/adminService.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useToast } from '../../context/ToastContext.jsx';

const PAGE_SIZE = 20;
const GRID_COLS = 'grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4';
const HEADERS = ['Tiêu đề', 'Loại', 'Danh mục', 'Người đăng', 'Ngày', ''];

function extractPostsPayload(res) {
  const data = res?.data ?? res;
  const posts = data?.posts ?? data?.items ?? (Array.isArray(data) ? data : []);
  return {
    posts: Array.isArray(posts) ? posts : [],
    total: Number(data?.total ?? posts.length ?? 0),
    totalPages: Number(data?.totalPages ?? 1),
  };
}

function DeleteConfirmModal({ postId, onCancel, onConfirm, busy }) {
  if (!postId) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Trash size={20} className="text-red-500" weight="light" />
        </div>
        <h3 className="text-base font-semibold text-center text-gray-900">
          Xóa bài đăng?
        </h3>
        <p className="text-sm text-gray-400 text-center mt-1">
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors active:scale-[0.98] disabled:opacity-60"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManagePosts() {
  useDocumentTitle('Admin · Bài đăng');
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getAllPosts(params);
      const payload = extractPostsPayload(res);
      setPosts(payload.posts);
      setTotal(payload.total);
      setTotalPages(Math.max(1, payload.totalPages || Math.ceil(payload.total / PAGE_SIZE)));
    } catch (err) {
      setError(err?.message || 'Không tải được bài đăng');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, statusFilter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const computedTotalPages = useMemo(
    () => Math.max(1, totalPages || Math.ceil(total / PAGE_SIZE)),
    [total, totalPages],
  );

  const handleDelete = (postId) => {
    setDeleteTarget(postId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget);
    try {
      await adminService.hardDeletePost(deleteTarget);
      setPosts((list) => list.filter((p) => p.id !== deleteTarget));
      setTotal((t) => Math.max(0, t - 1));
      toast.success('Đã xóa bài đăng');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.message || 'Xóa thất bại');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="-mx-4 md:-mx-6 -mt-4 md:-mt-6">
      <div className="px-8 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Quản lý bài đăng</h1>
            <p className="text-sm text-gray-400">{total} bài đăng</p>
          </div>
          <div className="hidden sm:flex w-9 h-9 rounded-lg bg-blue-50 items-center justify-center">
            <Article size={18} className="text-blue-500" weight="light" />
          </div>
        </div>

        <div className="flex gap-3 mt-4 flex-wrap">
          <input
            placeholder="Tìm tiêu đề, người đăng..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 w-64"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              setPage(1);
              setTypeFilter(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
          >
            <option value="">Tất cả loại</option>
            <option value="lost">Mất đồ</option>
            <option value="found">Nhặt được</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500 bg-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="searching">Đang tìm</option>
            <option value="resolved">Đã tìm thấy</option>
          </select>
        </div>
      </div>

      <div className="px-8 py-4">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className={`${GRID_COLS} px-5 py-3 bg-gray-50 border-b border-gray-100`}>
            {HEADERS.map((h) => (
              <span
                key={h || 'actions'}
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`${GRID_COLS} px-5 py-3.5`}>
                  <div className="col-span-6 h-8 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="px-5 py-10 text-sm text-red-600 text-center">{error}</p>
          ) : posts.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-500 text-center">
              Không có bài đăng nào.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {posts.map((post) => {
                const postType = post.type || post.post_type;
                const isDeleted = Boolean(post.is_deleted);

                return (
                  <div
                    key={post.id}
                    className={`${GRID_COLS} px-5 py-3.5 items-center hover:bg-gray-50 transition-colors ${
                      isDeleted ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate font-medium">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">#{post.id}</p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                        postType === 'lost'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {postType === 'lost' ? 'Mất đồ' : 'Nhặt được'}
                    </span>

                    <span className="text-sm text-gray-600 truncate">
                      {post.category || '—'}
                    </span>

                    <span className="text-sm text-gray-600 truncate">
                      {post.user_name || post.owner_name || '—'}
                    </span>

                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>

                    <div className="flex items-center gap-1 justify-end">
                      <a
                        href={`/posts/${post.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        aria-label="Xem bài đăng"
                      >
                        <Eye size={15} weight="light" />
                      </a>
                      {!isDeleted && (
                        <button
                          type="button"
                          disabled={busyId === post.id}
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label="Xóa bài đăng"
                        >
                          <Trash size={15} weight="light" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Hiển thị {posts.length} / {total} bài
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Trước
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  {page} / {computedTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(computedTotalPages, p + 1))}
                  disabled={page === computedTotalPages}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        postId={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        busy={busyId === deleteTarget}
      />
    </div>
  );
}
