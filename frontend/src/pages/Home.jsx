import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MagnifyingGlass } from '@phosphor-icons/react';
import PostFilter from '../components/post/PostFilter.jsx';
import PostCard from '../components/post/PostCard.jsx';
import PostCardSkeleton from '../components/post/PostCardSkeleton.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { postService } from '../services/postService.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const INITIAL_FILTERS = { type: '', category: '', location: '', date: '' };
const PAGE_SIZE = 12;

export default function Home() {
  useDocumentTitle('Tìm đồ thất lạc');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search input 400ms
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const fetchPosts = useCallback(
    async (nextPage, { append } = { append: false }) => {
      const params = {
        ...filters,
        search: debouncedSearch || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      };
      Object.keys(params).forEach((k) => {
        if (params[k] === '' || params[k] == null) delete params[k];
      });

      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const res = await postService.getPosts(params);
        const payload = res?.data || {};
        const items = Array.isArray(payload) ? payload : payload.posts || payload.items || [];
        const more = payload.totalPages ? nextPage < payload.totalPages : items.length >= PAGE_SIZE;

        setPosts((prev) => (append ? [...prev, ...items] : items));
        setHasMore(more);
        setPage(nextPage);
      } catch (e) {
        setError(e?.message || 'Không tải được danh sách bài đăng');
        if (!append) setPosts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, debouncedSearch],
  );

  // Reset & refetch when filters or debounced search change
  useEffect(() => {
    fetchPosts(1, { append: false });
  }, [fetchPosts]);

  return (
    <div className="min-h-[100dvh] pb-20 md:pb-8">
      <PostFilter
        value={filters}
        onChange={setFilters}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />

      <div className="max-w-6xl mx-auto px-4 py-5">
        {loading ? (
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </Grid>
        ) : error ? (
          <EmptyState
            title="Đã xảy ra lỗi"
            message={error}
            action={
              <button
                type="button"
                onClick={() => fetchPosts(1, { append: false })}
                className="text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium"
              >
                Thử lại
              </button>
            }
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={MagnifyingGlass}
            title="Chưa có bài đăng nào"
            message="Hãy là người đầu tiên đăng tin mất đồ hoặc nhặt được đồ."
            action={
              <Link
                to="/posts/create"
                className="inline-flex items-center gap-1.5 text-sm bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium"
              >
                <Plus size={16} weight="light" />
                Đăng bài
              </Link>
            }
          />
        ) : (
          <>
            <Grid>
              {posts.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </Grid>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => fetchPosts(page + 1, { append: true })}
                  className="text-sm bg-white border border-gray-200 hover:border-accent hover:text-accent text-gray-700 px-5 py-2 rounded-lg font-medium disabled:opacity-60"
                >
                  {loadingMore ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  );
}
