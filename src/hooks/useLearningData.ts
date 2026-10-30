import { useCallback, useEffect, useState } from 'react';
import { db, initializeDatabase, replaceDatabase } from '../db';
import { createId } from '../lib/id';
import { SUBJECT_COLORS, type BackupData, type StudySession, type Subject } from '../types';

interface NewSession {
  subjectId: string;
  startedAt: number;
  durationMs: number;
}

export function useLearningData() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextSubjects, nextSessions] = await Promise.all([
      db.subjects.orderBy('sortOrder').toArray(),
      db.sessions.orderBy('startedAt').reverse().toArray(),
    ]);
    setSubjects(nextSubjects);
    setSessions(nextSessions);
  }, []);

  useEffect(() => {
    let active = true;
    initializeDatabase()
      .then(() => {
        if ('storage' in navigator && navigator.storage.persist) {
          void navigator.storage.persist().catch(() => undefined);
        }
        if (active) void refresh();
      })
      .catch(() => active && setError('本地数据读取失败，请刷新页面重试。'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [refresh]);

  const addSubject = useCallback(
    async (rawName: string) => {
      const name = rawName.trim();
      if (!name) throw new Error('请输入科目名称。');
      const latest = await db.subjects.orderBy('sortOrder').toArray();
      if (latest.some((subject) => subject.name === name)) throw new Error('这个科目已经存在。');
      const subject: Subject = {
        id: createId('subject'),
        name,
        color: SUBJECT_COLORS[latest.length % SUBJECT_COLORS.length],
        sortOrder: latest.length,
        createdAt: Date.now(),
      };
      await db.subjects.add(subject);
      await refresh();
      return subject;
    },
    [refresh],
  );

  const renameSubject = useCallback(
    async (id: string, rawName: string) => {
      const name = rawName.trim();
      if (!name) throw new Error('科目名称不能为空。');
      const duplicate = await db.subjects.filter((subject) => subject.name === name && subject.id !== id).count();
      if (duplicate) throw new Error('这个科目已经存在。');
      await db.subjects.update(id, { name });
      await refresh();
    },
    [refresh],
  );

  const addSession = useCallback(
    async (input: NewSession) => {
      const session: StudySession = {
        id: createId('session'),
        subjectId: input.subjectId,
        startedAt: input.startedAt,
        durationMs: Math.max(1, Math.round(input.durationMs)),
        createdAt: Date.now(),
      };
      await db.sessions.add(session);
      await refresh();
      return session;
    },
    [refresh],
  );

  const updateSession = useCallback(
    async (id: string, input: NewSession) => {
      await db.sessions.update(id, {
        subjectId: input.subjectId,
        startedAt: input.startedAt,
        durationMs: Math.max(1, Math.round(input.durationMs)),
      });
      await refresh();
    },
    [refresh],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await db.sessions.delete(id);
      await refresh();
    },
    [refresh],
  );

  const importBackup = useCallback(
    async (backup: BackupData) => {
      await replaceDatabase(backup.subjects, backup.sessions);
      await refresh();
    },
    [refresh],
  );

  const clearSessions = useCallback(async () => {
    await db.sessions.clear();
    await refresh();
  }, [refresh]);

  return {
    subjects,
    sessions,
    loading,
    error,
    addSubject,
    renameSubject,
    addSession,
    updateSession,
    deleteSession,
    importBackup,
    clearSessions,
  };
}


