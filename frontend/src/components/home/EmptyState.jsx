import { MagnifyingGlass } from '@phosphor-icons/react';

export default function EmptyState() {
  return (
    <div className="state-card text-center">
      <div className="state-icon mx-auto">
        <MagnifyingGlass size={40} />
      </div>
      <h2>Chưa có bài đăng nào</h2>
      <p>Hãy thử đổi bộ lọc hoặc đăng tin đầu tiên cho cộng đồng sinh viên.</p>
    </div>
  );
}
