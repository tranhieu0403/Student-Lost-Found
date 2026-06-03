import { useEffect, useState } from 'react';
import { postService } from '../services/postService.js';

export function usePosts(filters) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    postService
      .getPosts(filters)
      .then((res) => {
        if (!mounted) return;
        const data = res || {};
        const payload = data?.data || data;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.posts)
          ? payload.posts
          : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        mounted && setData(items);
      })
      .catch((e) => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}
