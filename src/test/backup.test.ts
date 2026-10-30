import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from '../lib/backup';
import type { StudySession, Subject } from '../types';

const subject: Subject = { id: 'subject-1', name: '阅读', color: '#abc', sortOrder: 0, createdAt: 1 };
const session: StudySession = { id: 'session-1', subjectId: subject.id, startedAt: 100, durationMs: 60_000, createdAt: 200 };

describe('backup helpers', () => {
  it('round-trips a valid backup', () => {
    const backup = createBackup([subject], [session]);
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.subjects).toEqual([subject]);
    expect(parsed.sessions).toEqual([session]);
  });

  it('rejects malformed JSON and unknown formats', () => {
    expect(() => parseBackup('{oops')).toThrow('有效的 JSON');
    expect(() => parseBackup(JSON.stringify({ app: 'other', version: 1, subjects: [], sessions: [] }))).toThrow('有效');
  });

  it('rejects sessions whose subject is missing', () => {
    const backup = createBackup([subject], [session]);
    backup.sessions[0].subjectId = 'missing';
    expect(() => parseBackup(JSON.stringify(backup))).toThrow('无法对应科目');
  });
});
