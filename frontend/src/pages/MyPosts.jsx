import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  MapPin,
  Clock,
  ImageBroken,
  CheckCircle,
  PencilSimple,
  Trash,
  Notebook,
} from '@phosphor-icons/react';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { postService } from '../services/postService.js';
import { formatDate } from '../utils/formatDate.js';
import { POST_STATUS } from '../utils/constants.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'all', label: 'Tất cả', filter: () => true },
  { key: POST_STATUS.SEARCHING, label: 'Đang tìm', filter: (p) => p.status === POST_STATUS.SEARCHING },
  { key: POST_STATUS.RESOLVED, label: 'Đã tìm thấy', filter: (p) => p.status === POST_STATUS.RESOLVED },
];

export default function MyPosts() {
  useDocumentTitle('Bài đăng của tôi');
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    postService
      .getMyPosts()
      .then((res) => {
        if (!mounted) return;
        const data = res || {};
        const payload = data?.data || data; // unwrap { success, data } or use direct array/object
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.posts)
          ? payload.posts
          : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        setPosts(items);
      })
      .catch((e) => mounted && setError(e?.message || 'Không tải được bài đăng'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(() => ({
    all: posts.length,
    [POST_STATUS.SEARCHING]: posts.filter((p) => p.status === POST_STATUS.SEARCHING).length,
    [POST_STATUS.RESOLVED]: posts.filter((p) => p.status === POST_STATUS.RESOLVED).length,
  }), [posts]);

  const visible = useMemo(() => {
    const t = TABS.find((x) => x.key === tab) || TABS[0];
    return posts.filter(t.filter);
  }, [posts, tab]);

  const handleResolve = async (id) => {
    const prev = posts;
    setPosts((list) => list.map((p) => (p.id === id ? { ...p, status: POST_STATUS.RESOLVED } : p)));
    setBusyId(id);
    try {
      await postService.updatePostStatus(id, POST_STATUS.RESOLVED);
      toast.success('Đã đánh dấu tìm thấy');
    } catch (e) {
      setPosts(prev);
      toast.error(e?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa bài đăng này? Hành động không thể hoàn tác.')) return;
    const prev = posts;
    setPosts((list) => list.filter((p) => p.id !== id));
    setBusyId(id);
    try {
      await postService.deletePost(id);
      toast.success('Đã xóa bài đăng');
    } catch (e) {
      setPosts(prev);
      toast.error(e?.message || 'Xóa thất bại');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bài đăng của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các bài đăng mất / nhặt được của bạn.
          </p>
        </div>
        <Link
          to="/posts/create"
          className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg active:scale-[0.98]"
        >
          <Plus size={16} weight="light" />
          Đăng bài mới
        </Link>
      </header>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto -mx-1 px-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                active
                  ? 'bg-accent-light border-accent text-accent-hover'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {t.label}
              <span className={`text-xs ${active ? 'text-accent-hover' : 'text-gray-400'}`}>
                ({counts[t.key] ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <EmptyState title="Đã xảy ra lỗi" message={error} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Notebook}
          title={posts.length === 0 ? 'Bạn chưa có bài đăng nào' : 'Không có bài trong tab này'}
          message={
            posts.length === 0
              ? 'Hãy bắt đầu bằng cách đăng tin mất đồ hoặc nhặt được đồ.'
              : 'Chọn tab khác để xem các bài còn lại.'
          }
          action={
            posts.length === 0 ? (
              <Link
                to="/posts/create"
                className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg active:scale-[0.98]"
              >
                <Plus size={16} weight="light" />
                Đăng bài đầu tiên
              </Link>
            ) : null
          }
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((p) => (
            <MyPostCard
              key={p.id}
              post={p}
              busy={busyId === p.id}
              onResolve={() => handleResolve(p.id)}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function MyPostCard({ post, busy, onResolve, onDelete }) {
  const cover = post.images?.[0]?.image_url || post.images?.[0] || post.image_url;
  const isResolved = post.status === POST_STATUS.RESOLVED;
  const matchCount = post.match_count || post.matchCount || 0;

  return (
    <li className="flex gap-4 bg-white border border-gray-200/70 rounded-2xl p-3 md:p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]">
      <Link
        to={`/posts/${post.id}`}
        className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300"
      >
        {cover ? (
          <img src={cover} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <ImageBroken size={24} weight="light" />
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge type={post.type} />
          <Badge status={post.status} />
        </div>

        <Link
          to={`/posts/${post.id}`}
          className="mt-1.5 text-sm md:text-base font-medium text-gray-900 line-clamp-1 hover:text-accent"
        >
          {post.title}
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-1">
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin size={12} weight="light" />
            {post.location || '—'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} weight="light" />
            {post.date ? formatDate(post.date) : ''}
          </span>
          {matchCount > 0 && (
            <span className="text-accent">{matchCount} gợi ý khớp</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!isResolved && (
            <button
              type="button"
              onClick={onResolve}
              disabled={busy}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent-light/50 disabled:opacity-60"
            >
              <CheckCircle size={14} weight="light" />
              Đánh dấu đã tìm
            </button>
          )}
          <Link
            to={`/posts/${post.id}/edit`}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <PencilSimple size={14} weight="light" />
            Sửa
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash size={14} weight="light" />
            Xóa
          </button>
        </div>
      </div>
    </li>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="flex gap-4 bg-white border border-gray-200/70 rounded-2xl p-3 md:p-4"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl bg-gray-100 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-1.5">
              <div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" />
            </div>
            <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-7 w-28 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
