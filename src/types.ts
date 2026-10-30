export type Tab = 'focus' | 'records' | 'insights';
export type TimerAnimation = 'soft' | 'sweep' | 'pulse' | 'flipclock' | 'none';

export interface Subject {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  startedAt: number;
  durationMs: number;
  createdAt: number;
}

export interface ActiveSession {
  subjectId: string;
  startedAt: number;
  accumulatedMs: number;
  resumedAt: number | null;
}

export interface BackupData {
  app: 'still-focus';
  version: 1;
  exportedAt: string;
  subjects: Subject[];
  sessions: StudySession[];
}

export const SUBJECT_COLORS = [
  '#b8e6c9',
  '#d9c5a3',
  '#a9c7e8',
  '#ddb9d5',
  '#c9d69f',
  '#e8b5a8',
] as const;
