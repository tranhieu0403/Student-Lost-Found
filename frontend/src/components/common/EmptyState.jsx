import { MagnifyingGlass } from '@phosphor-icons/react';

export default function EmptyState({
  icon: Icon = MagnifyingGlass,
  title = 'Không có kết quả',
  message = 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <Icon size={48} weight="light" className="text-gray-300 mb-4" />
      <h3 className="text-base font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
