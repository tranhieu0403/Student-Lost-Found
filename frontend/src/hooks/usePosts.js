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
        const payload = res?.data || {};
        setData(Array.isArray(payload) ? payload : payload.posts || payload.items || []);
      })
      .catch((e) => mounted && setError(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}
