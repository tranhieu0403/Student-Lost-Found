const VIETNAM_TZ = 'Asia/Ho_Chi_Minh';

/**
 * Helper: Convert UTC timestamp to Vietnam timezone for calculations
 */
function getVietnamTime(dateValue) {
  const date = new Date(dateValue);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const result = {};
  for (const part of parts) {
    if (part.type !== 'literal') result[part.type] = part.value;
  }
  return new Date(
    `${result.year}-${result.month}-${result.day}T${result.hour}:${result.minute}:${result.second}`
  );
}

export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('vi-VN', { timeZone: VIETNAM_TZ });
}

export function formatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleTimeString('vi-VN', {
    timeZone: VIETNAM_TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(value) {
  if (!value) return '';
  
  const messageTimeVN = getVietnamTime(value);
  const nowVN = getVietnamTime(new Date());
  const diff = Math.floor((nowVN.getTime() - messageTimeVN.getTime()) / 1000);

  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày`;
  return formatDate(value);
}

export function formatMessageTime(value) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleTimeString('vi-VN', {
    timeZone: VIETNAM_TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date(d1)) === formatter.format(new Date(d2));
}

export function formatDaySeparator(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  
  if (isSameDay(date, now)) return 'Hôm nay';
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Hôm qua';

  return date.toLocaleDateString('vi-VN', {
    timeZone: VIETNAM_TZ,
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
}
