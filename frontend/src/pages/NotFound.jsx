import { Link } from 'react-router-dom';
import { Compass, House } from '@phosphor-icons/react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Không tìm thấy trang');

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex flex-col items-center justify-center text-center px-6 py-16">
      <Compass size={48} weight="light" className="text-gray-300" />
      <p className="font-mono text-6xl md:text-7xl text-gray-200 mt-4 leading-none select-none">
        404
      </p>
      <h1 className="text-xl font-semibold text-gray-900 mt-6">
        Trang không tồn tại
      </h1>
      <p className="text-sm text-gray-500 mt-2 max-w-md">
        Đường dẫn bạn truy cập có thể đã bị xóa hoặc chưa từng tồn tại.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg active:scale-[0.98]"
      >
        <House size={16} weight="light" />
        Về trang chủ
      </Link>
    </div>
  );
}
