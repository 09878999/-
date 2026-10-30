export const MINUTE_MS = 60_000;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

export function getElapsedMs(session: { accumulatedMs: number; resumedAt: number | null }, now = Date.now()) {
  return Math.max(0, session.accumulatedMs + (session.resumedAt === null ? 0 : now - session.resumedAt));
}

export function formatTimer(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.round(ms / MINUTE_MS));
  if (totalMinutes < 1) return '不足 1 分钟';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} 分钟`;
  if (minutes === 0) return `${hours} 小时`;
  return `${hours} 小时 ${minutes} 分钟`;
}

export function formatDurationShort(ms: number) {
  const totalMinutes = Math.max(0, Math.round(ms / MINUTE_MS));
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function roundMinutes(ms: number) {
  return Math.max(1, Math.round(ms / MINUTE_MS));
}

export function startOfDay(value: number | Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function startOfWeek(value: number | Date) {
  const date = new Date(startOfDay(value));
  const day = date.getDay();
  const offset = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - offset);
  return date.getTime();
}

export function startOfMonth(value: number | Date) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

export function endOfDay(value: number | Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export function addDays(value: number | Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

export function isSameDay(a: number | Date, b: number | Date) {
  return startOfDay(a) === startOfDay(b);
}

export function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp);
}

export function formatDateHeading(timestamp: number, now = Date.now()) {
  if (isSameDay(timestamp, now)) return '今天';
  if (isSameDay(timestamp, addDays(now, -1))) return '昨天';
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(timestamp);
}

export function formatShortDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(timestamp);
}

export function formatWeekday(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(timestamp).replace('周', '');
}

export function toDateInputValue(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toTimeInputValue(timestamp: number) {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function fromDateTimeInputs(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).getTime();
}

export function formatMonthLabel(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(timestamp);
}
