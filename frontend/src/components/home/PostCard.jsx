import { Link } from 'react-router-dom';
import { CalendarBlank, MapPin } from '@phosphor-icons/react';

const TYPE_LABEL = {
  lost: 'MẤT ĐỒ',
  found: 'NHẶT ĐƯỢC',
};

const STATUS_LABEL = {
  searching: 'Đang tìm',
  resolved: 'Đã tìm thấy',
};

export default function PostCard({ post }) {
  const typeClass = post.type === 'lost' ? 'badge-lost' : 'badge-found';
  const statusClass = post.status === 'resolved' ? 'badge-resolved' : 'badge-searching';

  return (
    <article className="post-card h-100">
      <div className="post-image-wrap">
        <img src={post.image} className="post-image" alt={post.title} loading="lazy" />
        <div className="post-badges">
          <span className={`post-badge ${typeClass}`}>{TYPE_LABEL[post.type]}</span>
          <span className={`post-badge ${statusClass}`}>{STATUS_LABEL[post.status]}</span>
        </div>
      </div>

      <div className="post-card-body">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-description">{post.description}</p>

        <div className="post-meta">
          <span>
            <MapPin size={16} />
            {post.location}
          </span>
          <span>
            <CalendarBlank size={16} />
            {post.date}
          </span>
        </div>

        <Link to={`/posts/${post.id}`} className="btn btn-outline-primary post-detail-btn">
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}
