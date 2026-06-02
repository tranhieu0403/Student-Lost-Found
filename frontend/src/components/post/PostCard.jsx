import { Link } from 'react-router-dom';
import { MapPin, Clock, ImageBroken, ArrowRight } from '@phosphor-icons/react';
import Badge from '../common/Badge.jsx';
import { formatDate } from '../../utils/formatDate.js';
import { POST_STATUS } from '../../utils/constants.js';

export default function PostCard({ post, index = 0 }) {
  if (!post) return null;

  const cover = post.images?.[0]?.image_url || post.images?.[0] || post.image_url;
  const date = post.date || post.created_at || post.createdAt;
  const isResolved = post.status === POST_STATUS.RESOLVED;
  const delay = Math.min(index * 60, 300);

  return (
    <Link
      to={`/posts/${post.id}`}
      style={{ animationDelay: `${delay}ms` }}
      className={`stagger-item group block bg-white border border-gray-200/70 rounded-2xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 ${
        isResolved ? 'opacity-75' : ''
      }`}
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <ImageBroken size={32} weight="light" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge type={post.type} />
          <Badge status={post.status} />
        </div>

        <h3 className="text-base font-medium text-gray-900 line-clamp-2 leading-snug">
          {post.title}
        </h3>

        {post.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {post.description}
          </p>
        )}

        <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 truncate min-w-0">
            <MapPin size={14} weight="light" className="shrink-0" />
            <span className="truncate">{post.location || '—'}</span>
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            <Clock size={14} weight="light" />
            {date ? formatDate(date) : ''}
          </span>
        </div>

        <div className="pt-1">
          <span className="inline-flex items-center gap-1 text-sm text-accent group-hover:underline">
            Xem chi tiết
            <ArrowRight size={14} weight="light" />
          </span>
        </div>
      </div>
    </Link>
  );
}
