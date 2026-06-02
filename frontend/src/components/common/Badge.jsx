import { POST_TYPE, POST_STATUS } from '../../utils/constants.js';

const BASE = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border';

const TYPE_STYLES = {
  [POST_TYPE.LOST]: 'bg-red-100 text-red-700 border-red-200',
  [POST_TYPE.FOUND]: 'bg-green-100 text-green-700 border-green-200',
};

const TYPE_LABELS = {
  [POST_TYPE.LOST]: 'MẤT ĐỒ',
  [POST_TYPE.FOUND]: 'NHẶT ĐƯỢC',
};

const STATUS_STYLES = {
  [POST_STATUS.SEARCHING]: 'bg-amber-50 text-amber-700 border-amber-200',
  [POST_STATUS.RESOLVED]: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_LABELS = {
  [POST_STATUS.SEARCHING]: 'Đang tìm',
  [POST_STATUS.RESOLVED]: 'Đã tìm thấy',
};

export default function Badge({ type, status, className = '' }) {
  if (type) {
    const cls = TYPE_STYLES[type] || 'bg-gray-100 text-gray-600 border-gray-200';
    const label = TYPE_LABELS[type] || type;
    return <span className={`${BASE} ${cls} ${className}`}>{label}</span>;
  }

  if (status) {
    const cls = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200';
    const label = STATUS_LABELS[status] || status;
    return <span className={`${BASE} ${cls} ${className}`}>{label}</span>;
  }

  return null;
}
