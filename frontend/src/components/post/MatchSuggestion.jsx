import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ImageBroken, Sparkle } from '@phosphor-icons/react';
import { matchService } from '../../services/matchService.js';
import { formatDate } from '../../utils/formatDate.js';

const MAX_ITEMS = 3;
const DOTS = 5;
const MAX_SCORE = 10;

export default function MatchSuggestion({ postId, postType }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    let mounted = true;
    setLoading(true);
    matchService
      .getMatches(postId)
      .then((res) => {
        if (!mounted) return;
        const items = Array.isArray(res?.data) ? res.data : res?.data?.items || [];
        const sorted = [...items].sort((a, b) => (b.score || 0) - (a.score || 0));
        setMatches(sorted.slice(0, MAX_ITEMS));
      })
      .catch(() => mounted && setMatches([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [postId]);

  if (loading) {
    return (
      <Section>
        <p className="text-xs text-gray-500">Đang tìm bài đăng liên quan...</p>
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <MatchSkeleton key={i} />
          ))}
        </div>
      </Section>
    );
  }

  if (matches.length === 0) return null;

  const counterpartLabel =
    postType === 'lost' ? 'đồ nhặt được' : postType === 'found' ? 'người mất' : 'bài đăng';

  return (
    <Section>
      <p className="text-xs text-gray-500">
        Hệ thống tìm thấy <span className="font-medium text-gray-700">{matches.length}</span>{' '}
        {counterpartLabel} có thể liên quan
      </p>
      <ul className="space-y-2">
        {matches.map((m) => (
          <MatchItem key={m.id} match={m} />
        ))}
      </ul>
    </Section>
  );
}

function Section({ children }) {
  return (
    <section className="bg-white border border-gray-200/70 rounded-2xl p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-900 inline-flex items-center gap-1.5">
        <Sparkle size={16} weight="light" className="text-accent" />
        Gợi ý tương tự
      </h3>
      {children}
    </section>
  );
}

function MatchItem({ match }) {
  const cover = match.images?.[0]?.image_url || match.images?.[0] || match.image_url;
  const date = match.date || match.created_at;

  return (
    <li>
      <Link
        to={`/posts/${match.id}`}
        className="flex gap-3 p-2 rounded-xl hover:bg-bg-subtle"
      >
        <div className="w-16 h-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-gray-300">
          {cover ? (
            <img src={cover} alt={match.title} className="w-full h-full object-cover" />
          ) : (
            <ImageBroken size={20} weight="light" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 line-clamp-1">{match.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
            {match.location || '—'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{date ? formatDate(date) : ''}</p>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <ScoreDots score={match.score || 0} />
            <span className="inline-flex items-center gap-0.5 text-xs text-accent">
              Xem <ArrowRight size={12} weight="light" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function ScoreDots({ score }) {
  const filled = Math.max(0, Math.min(DOTS, Math.round((score / MAX_SCORE) * DOTS)));
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-[10px] text-gray-500">Độ khớp:</span>
      {Array.from({ length: DOTS }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < filled ? 'bg-accent' : 'bg-gray-200'
          }`}
        />
      ))}
    </span>
  );
}

function MatchSkeleton() {
  return (
    <div className="flex gap-3 p-2 rounded-xl">
      <div className="w-16 h-16 shrink-0 rounded-lg bg-gray-100 animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
