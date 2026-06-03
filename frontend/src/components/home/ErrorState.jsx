import { WarningCircle } from '@phosphor-icons/react';

export default function ErrorState({ onRetry }) {
  return (
    <div className="state-card text-center">
      <div className="state-icon state-icon-danger mx-auto">
        <WarningCircle size={40} />
      </div>
      <h2>Đã xảy ra lỗi</h2>
      <p>Không thể tải danh sách bài đăng. Vui lòng thử lại.</p>
      <button type="button" className="btn btn-primary home-primary-btn" onClick={onRetry}>
        Thử lại
      </button>
    </div>
  );
}
