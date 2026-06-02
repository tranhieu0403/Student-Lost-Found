import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CaretRight,
  MapPin,
  Clock,
  User,
  ChatCircle,
  CheckCircle,
  ImageBroken,
  CircleNotch,
} from '@phosphor-icons/react';
import Badge from '../components/common/Badge.jsx';
import MatchSuggestion from '../components/post/MatchSuggestion.jsx';
import { postService } from '../services/postService.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useToast } from '../context/ToastContext.jsx';
import { POST_TYPE, POST_STATUS } from '../utils/constants.js';
import { formatDate } from '../utils/formatDate.js';

const TYPE_BREADCRUMB = {
  [POST_TYPE.LOST]: 'Mất đồ',
  [POST_TYPE.FOUND]: 'Nhặt được',
};

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [updating, setUpdating] = useState(false);

  useDocumentTitle(post?.title || 'Chi tiết bài đăng');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    postService
      .getPostById(id)
      .then((res) => mounted && setPost(res?.data || res))
      .catch((e) => mounted && setError(e?.message || 'Không tải được bài đăng'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleResolve = async () => {
    if (!post || updating) return;
    if (!window.confirm('Xác nhận đã tìm thấy đồ? Bài đăng sẽ chuyển sang trạng thái "Đã tìm thấy".')) return;
    setUpdating(true);
    try {
      await postService.updatePostStatus(post.id, POST_STATUS.RESOLVED);
      setPost((p) => ({ ...p, status: POST_STATUS.RESOLVED }));
      toast.success('Đã đánh dấu tìm thấy');
    } catch (e) {
      toast.error(e?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleMessage = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (poster.id) {
      navigate(`/chat/${poster.id}`);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-gray-500">{error || 'Không tìm thấy bài đăng'}</p>
        <Link to="/" className="inline-block mt-4 text-sm text-accent hover:underline">
          ← Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const images = (post.images || []).map((i) => i?.image_url || i).filter(Boolean);
  const isOwner = user?.id && (user.id === post.user_id || user.id === post.user?.id);
  const isResolved = post.status === POST_STATUS.RESOLVED;
  const poster = post.user || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content */}
        <article className="lg:col-span-8 space-y-6">
          <Breadcrumb type={post.type} title={post.title} />

          <Gallery images={images} active={activeImage} onSelect={setActiveImage} />

          {/* Meta */}
          <header className="space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge type={post.type} />
              <Badge status={post.status} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                {post.title}
              </h1>
              {isOwner && (
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={isResolved || updating}
                  className={`shrink-0 inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg active:scale-[0.98] ${
                    isResolved
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-accent hover:bg-accent-hover text-white disabled:opacity-70'
                  }`}
                >
                  {updating ? (
                    <CircleNotch size={16} weight="light" className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} weight="light" />
                  )}
                  {isResolved ? 'Đã tìm thấy' : 'Đánh dấu đã tìm'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} weight="light" />
                {post.location}
                {post.specific_location && ` · ${post.specific_location}`}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} weight="light" />
                {post.date ? formatDate(post.date) : ''}
              </span>
              {poster.name && (
                <span className="inline-flex items-center gap-1">
                  <User size={14} weight="light" />
                  {poster.name}
                </span>
              )}
            </div>
          </header>

          {/* Description */}
          <div className="bg-white border border-gray-200/70 rounded-2xl p-5">
            <h2 className="text-base font-medium text-gray-900 mb-2">Mô tả</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.description || 'Không có mô tả.'}
            </p>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-20 lg:self-start">
          <PosterCard
            poster={poster}
            disabled={isOwner || !user}
            onMessage={handleMessage}
          />
          <MatchSuggestion postId={post.id} postType={post.type} />
        </aside>
      </div>
    </div>
  );
}

function Breadcrumb({ type, title }) {
  return (
    <nav className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
      <Link to="/" className="hover:text-gray-700">Trang chủ</Link>
      <CaretRight size={12} weight="light" />
      <span>{TYPE_BREADCRUMB[type] || 'Bài đăng'}</span>
      <CaretRight size={12} weight="light" />
      <span className="text-gray-700 line-clamp-1">{title}</span>
    </nav>
  );
}

function Gallery({ images, active, onSelect }) {
  const hasImages = images.length > 0;
  const current = hasImages ? images[Math.min(active, images.length - 1)] : null;

  return (
    <div className="space-y-2">
      <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center text-gray-300">
        {current ? (
          <img src={current} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageBroken size={40} weight="light" />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(idx)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                idx === active ? 'border-accent' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PosterCard({ poster, disabled, onMessage }) {
  const initial = (poster?.name || '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <section className="bg-white border border-gray-200/70 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Người đăng</h3>
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-accent-light text-accent text-base font-medium flex items-center justify-center">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {poster?.name || 'Ẩn danh'}
          </p>
          {poster?.email && (
            <p className="text-xs text-gray-500 truncate">{poster.email}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onMessage}
        disabled={disabled}
        className="w-full inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <ChatCircle size={16} weight="light" />
        Nhắn tin
      </button>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
          <div className="aspect-video bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
