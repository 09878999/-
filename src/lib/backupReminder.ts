export const BACKUP_REMINDER_STORAGE_KEY = 'still-focus-last-backup-v1';
export const BACKUP_REMINDER_DAYS = 30;
const DAY_MS = 86_400_000;

export function readLastBackupAt(): number | null {
  try {
    const raw = localStorage.getItem(BACKUP_REMINDER_STORAGE_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function recordBackupTime(now = Date.now()) {
  try {
    localStorage.setItem(BACKUP_REMINDER_STORAGE_KEY, String(now));
  } catch {
    // Private browsing can reject storage; the reminder will return next launch.
  }
  return now;
}

export function shouldRemindBackup(hasData: boolean, lastBackupAt: number | null, now = Date.now()) {
  if (!hasData) return false;
  if (lastBackupAt === null) return true;
  return now - lastBackupAt >= BACKUP_REMINDER_DAYS * DAY_MS;
}

export function formatLastBackupTime(timestamp: number | null) {
  if (timestamp === null) return '尚未备份';
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(timestamp);
}
