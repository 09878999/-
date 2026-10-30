import type { StudySession, Subject } from '../types';
import { addDays, DAY_MS, startOfDay } from './time';

export interface DailyDatum {
  date: number;
  durationMs: number;
}

export function sessionsInRange(sessions: StudySession[], start: number, end: number) {
  return sessions.filter((session) => session.startedAt >= start && session.startedAt <= end);
}

export function totalDuration(sessions: StudySession[]) {
  return sessions.reduce((total, session) => total + session.durationMs, 0);
}

export function buildDailySeries(sessions: StudySession[], end: number, days: number): DailyDatum[] {
  const endDay = startOfDay(end);
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(endDay, index - days + 1);
    const durationMs = sessions
      .filter((session) => session.startedAt >= date && session.startedAt < date + DAY_MS)
      .reduce((total, session) => total + session.durationMs, 0);
    return { date, durationMs };
  });
}

export interface SubjectTotal {
  subject: Subject;
  durationMs: number;
  share: number;
}

export function buildSubjectTotals(sessions: StudySession[], subjects: Subject[]): SubjectTotal[] {
  const totals = new Map<string, number>();
  sessions.forEach((session) => {
    totals.set(session.subjectId, (totals.get(session.subjectId) ?? 0) + session.durationMs);
  });
  const allDuration = totalDuration(sessions);
  return subjects
    .map((subject) => ({
      subject,
      durationMs: totals.get(subject.id) ?? 0,
      share: allDuration === 0 ? 0 : (totals.get(subject.id) ?? 0) / allDuration,
    }))
    .filter((item) => item.durationMs > 0)
    .sort((a, b) => b.durationMs - a.durationMs);
}

export interface HeatmapDatum {
  date: number;
  durationMs: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function buildHeatmap(sessions: StudySession[], end: number, days = 84): HeatmapDatum[] {
  const series = buildDailySeries(sessions, end, days);
  const peak = Math.max(...series.map((day) => day.durationMs), 1);
  return series.map((day) => {
    const ratio = day.durationMs / peak;
    let level: HeatmapDatum['level'] = 0;
    if (day.durationMs > 0) level = ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
    return { ...day, level };
  });
}

export function groupSessionsByDay(sessions: StudySession[]) {
  const groups = new Map<number, StudySession[]>();
  [...sessions]
    .sort((a, b) => b.startedAt - a.startedAt)
    .forEach((session) => {
      const day = startOfDay(session.startedAt);
      groups.set(day, [...(groups.get(day) ?? []), session]);
    });
  return Array.from(groups, ([date, items]) => ({ date, sessions: items, durationMs: totalDuration(items) }));
}
