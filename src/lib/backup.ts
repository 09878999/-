import type { BackupData, Goal, StudySession, Subject } from '../types';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isSubject(value: unknown): value is Subject {
  if (!value || typeof value !== 'object') return false;
  const subject = value as Record<string, unknown>;
  return (
    typeof subject.id === 'string' &&
    typeof subject.name === 'string' &&
    subject.name.trim().length > 0 &&
    typeof subject.color === 'string' &&
    isFiniteNumber(subject.sortOrder) &&
    isFiniteNumber(subject.createdAt)
  );
}

function isSession(value: unknown): value is StudySession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Record<string, unknown>;
  return (
    typeof session.id === 'string' &&
    typeof session.subjectId === 'string' &&
    isFiniteNumber(session.startedAt) &&
    isFiniteNumber(session.durationMs) &&
    session.durationMs > 0 &&
    isFiniteNumber(session.createdAt)
  );
}

function isGoal(value: unknown): value is Goal {
  if (!value || typeof value !== 'object') return false;
  const goal = value as Record<string, unknown>;
  return (
    typeof goal.id === 'string' &&
    typeof goal.text === 'string' &&
    goal.text.trim().length > 0 &&
    typeof goal.completed === 'boolean' &&
    isFiniteNumber(goal.createdAt) &&
    isFiniteNumber(goal.updatedAt)
  );
}

export function createBackup(subjects: Subject[], sessions: StudySession[], goals: Goal[]): BackupData {
  return {
    app: 'still-focus',
    version: 2,
    exportedAt: new Date().toISOString(),
    subjects,
    sessions,
    goals,
  };
}

export function parseBackup(raw: string): BackupData {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('备份文件不是有效的 JSON。');
  }
  if (!value || typeof value !== 'object') throw new Error('备份内容无法识别。');
  const data = value as Record<string, unknown>;
  if (data.app !== 'still-focus' || (data.version !== 1 && data.version !== 2)) {
    throw new Error('这不是静时的有效备份。');
  }
  if (!Array.isArray(data.subjects) || !Array.isArray(data.sessions)) throw new Error('备份内容不完整。');
  const goals = data.version === 2 ? data.goals : [];
  if (!Array.isArray(goals)) throw new Error('备份内容不完整。');
  if (!data.subjects.every(isSubject) || !data.sessions.every(isSession) || !goals.every(isGoal)) {
    throw new Error('备份数据格式不正确。');
  }
  if (data.subjects.length === 0) throw new Error('备份中没有任何科目。');

  const subjectIds = new Set(data.subjects.map((subject) => subject.id));
  if (data.sessions.some((session) => !subjectIds.has(session.subjectId))) {
    throw new Error('备份中存在无法对应科目的学习记录。');
  }

  return {
    app: 'still-focus',
    version: 2,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString(),
    subjects: data.subjects as Subject[],
    sessions: data.sessions as StudySession[],
    goals: goals as Goal[],
  };
}

export function backupFilename(date = new Date()) {
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `静时-学习记录-${stamp}.json`;
}
