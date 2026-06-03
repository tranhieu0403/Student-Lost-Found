const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

export function normalizePost(post) {
  const rawImages = post.images || post.image_urls || [];
  const images = rawImages.map((item) => {
    const url = typeof item === 'string' ? item : item?.image_url;
    return url ? resolveImageUrl(url) : null;
  }).filter(Boolean);

  const rawDate = post.date || post.incident_date || '';
  const date = rawDate instanceof Date
    ? rawDate.toISOString().slice(0, 10)
    : String(rawDate).slice(0, 10);

  return {
    ...post,
    type: post.type || post.post_type || '',
    category: post.category || post.category_name || '',
    date,
    location: post.location || '',
    description: post.description || '',
    title: post.title || '',
    images,
    image: images[0] || '',
  };
}

export function filterPosts(posts, { search = '', filters = {} }) {
  const keyword = search.trim().toLowerCase();
  const allCategories = filters.category === 'Tất cả danh mục' || !filters.category;
  const allLocations = filters.location === 'Tất cả khu vực' || !filters.location;

  return posts
    .map(normalizePost)
    .filter((post) => {
      const matchesSearch = !keyword
        || post.title.toLowerCase().includes(keyword)
        || post.description.toLowerCase().includes(keyword)
        || post.location.toLowerCase().includes(keyword);

      const matchesType = !filters.type || filters.type === 'all' || post.type === filters.type;

      const matchesCategory = allCategories || post.category === filters.category;

      const matchesLocation = allLocations
        || post.location.toLowerCase().includes(filters.location.toLowerCase());

      const matchesDate = !filters.date || post.date === filters.date;

      return matchesSearch && matchesType && matchesCategory && matchesLocation && matchesDate;
    });
}

export function extractPostsList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.posts)) return res.data.posts;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.posts)) return res.posts;
  return [];
}
