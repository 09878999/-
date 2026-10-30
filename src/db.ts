import Dexie, { type EntityTable } from 'dexie';
import { SUBJECT_COLORS, type StudySession, type Subject } from './types';

export class StillFocusDatabase extends Dexie {
  subjects!: EntityTable<Subject, 'id'>;
  sessions!: EntityTable<StudySession, 'id'>;

  constructor() {
    super('still-focus-db');
    this.version(1).stores({
      subjects: 'id, sortOrder, createdAt',
      sessions: 'id, subjectId, startedAt, createdAt',
    });
  }
}

export const db = new StillFocusDatabase();

const DEFAULT_SUBJECTS = ['数学', '英语', '编程', '阅读', '其他'];

export async function initializeDatabase() {
  if (!db.isOpen()) await db.open();
  const count = await db.subjects.count();
  if (count > 0) return;
  const createdAt = Date.now();
  await db.subjects.bulkPut(
    DEFAULT_SUBJECTS.map((name, index) => ({
      id: `subject-${index + 1}`,
      name,
      color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
      sortOrder: index,
      createdAt,
    })),
  );
}

export async function replaceDatabase(subjects: Subject[], sessions: StudySession[]) {
  if (!db.isOpen()) await db.open();
  await db.transaction('rw', db.subjects, db.sessions, async () => {
    await db.subjects.clear();
    await db.sessions.clear();
    await db.subjects.bulkAdd(subjects);
    if (sessions.length) await db.sessions.bulkAdd(sessions);
  });
}

