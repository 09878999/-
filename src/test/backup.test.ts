import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from '../lib/backup';
import type { Goal, StudySession, Subject } from '../types';

const subject: Subject = { id: 'subject-1', name: '阅读', color: '#abc', sortOrder: 0, createdAt: 1 };
const session: StudySession = { id: 'session-1', subjectId: subject.id, startedAt: 100, durationMs: 60_000, createdAt: 200 };
const goal: Goal = { id: 'goal-1', text: '雅思 7.0', completed: false, createdAt: 300, updatedAt: 300 };

describe('backup helpers', () => {
  it('round-trips subjects, sessions and goals', () => {
    const backup = createBackup([subject], [session], [goal]);
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.subjects).toEqual([subject]);
    expect(parsed.sessions).toEqual([session]);
    expect(parsed.goals).toEqual([goal]);
    expect(parsed.version).toBe(2);
  });

  it('accepts version 1 backups and restores them with an empty goal list', () => {
    const legacy = { app: 'still-focus', version: 1, exportedAt: '2026-10-01T00:00:00.000Z', subjects: [subject], sessions: [session] };
    expect(parseBackup(JSON.stringify(legacy)).goals).toEqual([]);
  });

  it('rejects malformed JSON and unknown formats', () => {
    expect(() => parseBackup('{oops')).toThrow('有效的 JSON');
    expect(() => parseBackup(JSON.stringify({ app: 'other', version: 2, subjects: [], sessions: [], goals: [] }))).toThrow('有效');
  });

  it('rejects sessions whose subject is missing', () => {
    const backup = createBackup([subject], [session], [goal]);
    backup.sessions[0].subjectId = 'missing';
    expect(() => parseBackup(JSON.stringify(backup))).toThrow('无法对应科目');
  });

  it('rejects malformed goal data', () => {
    const backup = createBackup([subject], [session], [goal]);
    backup.goals[0].text = '';
    expect(() => parseBackup(JSON.stringify(backup))).toThrow('格式不正确');
  });
});
