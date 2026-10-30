import { describe, expect, it } from 'vitest';
import {
  BACKUP_REMINDER_DAYS,
  BACKUP_REMINDER_STORAGE_KEY,
  formatLastBackupTime,
  readLastBackupAt,
  recordBackupTime,
  shouldRemindBackup,
} from '../lib/backupReminder';

describe('backup reminder', () => {
  it('does not remind when there is no user data', () => {
    expect(shouldRemindBackup(false, null, 100)).toBe(false);
  });

  it('reminds when there has never been a backup', () => {
    expect(shouldRemindBackup(true, null, 100)).toBe(true);
  });

  it('waits 30 days after a backup', () => {
    const now = new Date(2026, 9, 31, 12).getTime();
    expect(shouldRemindBackup(true, now - 29 * 86_400_000, now)).toBe(false);
    expect(shouldRemindBackup(true, now - BACKUP_REMINDER_DAYS * 86_400_000, now)).toBe(true);
  });

  it('records and reads the last successful backup time', () => {
    const timestamp = new Date(2026, 9, 31, 10, 30).getTime();
    expect(readLastBackupAt()).toBeNull();
    expect(recordBackupTime(timestamp)).toBe(timestamp);
    expect(localStorage.getItem(BACKUP_REMINDER_STORAGE_KEY)).toBe(String(timestamp));
    expect(readLastBackupAt()).toBe(timestamp);
    expect(formatLastBackupTime(timestamp)).toContain('10:30');
  });
});
