import { useMemo, useState, useEffect } from 'react';
// Navbar is rendered at App level
import SearchBar from '../components/home/SearchBar.jsx';
import FilterBar from '../components/home/FilterBar.jsx';
import PostCard from '../components/home/PostCard.jsx';
import EmptyState from '../components/home/EmptyState.jsx';
import ErrorState from '../components/home/ErrorState.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const INITIAL_FILTERS = {
  type: 'all',
  category: 'Tất cả danh mục',
  location: 'Tất cả khu vực',
  date: '',
};

import { postService } from '../services/postService.js';

// Posts will be loaded from API

export default function Home() {
  useDocumentTitle('Student Lost & Found');

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [hasError, setHasError] = useState(false);
  const [postsData, setPostsData] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  async function fetchPosts() {
    setLoadingPosts(true);
    try {
      const res = await postService.getPosts();
      // API returns { success: true, data: [...] } — normalize to array
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data?.posts)) list = res.data.posts;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.posts)) list = res.posts;
      else list = [];
      setPostsData(list);
      setHasError(false);
    } catch (err) {
      setHasError(true);
    } finally {
      setLoadingPosts(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchPosts();
    return () => { mounted = false; };
  }, []);

  const posts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const listSource = Array.isArray(postsData) ? postsData : [];
    return listSource.filter((post) => {
      const matchesSearch = !keyword
        || post.title.toLowerCase().includes(keyword)
        || post.description.toLowerCase().includes(keyword)
        || post.location.toLowerCase().includes(keyword);
      const matchesType = filters.type === 'all' || post.type === filters.type;
      const matchesCategory = filters.category === 'Tất cả danh mục' || post.category === filters.category;
      const matchesLocation = filters.location === 'Tất cả khu vực' || post.location.includes(filters.location);

      return matchesSearch && matchesType && matchesCategory && matchesLocation;
    });
  }, [filters, search, postsData]);

  return (
    <div className="home-page">
      {/* Navbar rendered by App */}

      <header className="home-hero">
        <div className="container text-center">
          <span className="hero-kicker">Student Lost &amp; Found</span>
          <h1>Tìm lại đồ thất lạc dễ dàng hơn</h1>
          <p>Kết nối người mất và người nhặt trong cộng đồng sinh viên.</p>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </header>

      <FilterBar filters={filters} onChange={setFilters} />

      <main className="container home-content">
        <div className="d-flex flex-column flex-sm-row align-items-sm-end justify-content-between gap-2 mb-4">
          <div>
            <h2 className="section-title">Bài đăng mới nhất</h2>
            <p className="section-subtitle mb-0">Đang hiển thị {posts.length} bài đăng phù hợp.</p>
          </div>
        </div>

        {hasError ? (
          <ErrorState onRetry={fetchPosts} />
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="row g-4">
            {posts.map((post) => (
              <div className="col-12 col-md-6 col-lg-4" key={post.id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
