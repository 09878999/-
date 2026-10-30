import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, replaceDatabase } from '../db';

describe('local database', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    localStorage.clear();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('seeds default subjects only once', async () => {
    await initializeDatabase();
    await initializeDatabase();
    const subjects = await db.subjects.toArray();
    expect(subjects).toHaveLength(5);
    expect(subjects.map((subject) => subject.name)).toContain('阅读');
  });

  it('replaces all data for backup restore', async () => {
    await initializeDatabase();
    await replaceDatabase(
      [{ id: 'custom', name: '设计', color: '#fff', sortOrder: 0, createdAt: 1 }],
      [{ id: 'session', subjectId: 'custom', startedAt: 10, durationMs: 60_000, createdAt: 20 }],
      [{ id: 'goal', text: '通过英语四级', completed: false, createdAt: 30, updatedAt: 30 }],
    );
    expect(await db.subjects.count()).toBe(1);
    expect((await db.subjects.get('custom'))?.name).toBe('设计');
    expect(await db.sessions.count()).toBe(1);
    expect((await db.goals.get('goal'))?.text).toBe('通过英语四级');
  });
});
