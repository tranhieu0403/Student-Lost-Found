import { useEffect } from 'react';

const SUFFIX = 'Lost & Found';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title.includes(SUFFIX) ? title : `${title} | ${SUFFIX}`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
