import { describe, expect, it } from 'vitest';
import { buildDailySeries, buildHeatmap, buildSubjectTotals, groupSessionsByDay, totalDuration } from '../lib/stats';
import { DAY_MS, startOfDay } from '../lib/time';
import type { StudySession, Subject } from '../types';

const subjects: Subject[] = [
  { id: 'math', name: '数学', color: '#aaa', sortOrder: 0, createdAt: 0 },
  { id: 'code', name: '编程', color: '#bbb', sortOrder: 1, createdAt: 0 },
];
const start = startOfDay(new Date(2026, 9, 30, 10).getTime());
const sessions: StudySession[] = [
  { id: 'one', subjectId: 'math', startedAt: start, durationMs: 30 * 60_000, createdAt: 0 },
  { id: 'two', subjectId: 'math', startedAt: start + 60_000, durationMs: 15 * 60_000, createdAt: 0 },
  { id: 'three', subjectId: 'code', startedAt: start + DAY_MS, durationMs: 45 * 60_000, createdAt: 0 },
];

describe('statistics helpers', () => {
  it('totals sessions and builds a complete daily series', () => {
    expect(totalDuration(sessions)).toBe(90 * 60_000);
    const series = buildDailySeries(sessions, start + DAY_MS, 2);
    expect(series.map((day) => day.durationMs)).toEqual([45 * 60_000, 45 * 60_000]);
  });

  it('builds sorted subject totals with shares', () => {
    const totals = buildSubjectTotals(sessions, subjects);
    expect(totals.map((item) => item.subject.id)).toEqual(['math', 'code']);
    expect(totals[0].durationMs).toBe(45 * 60_000);
    expect(totals[0].share).toBeCloseTo(0.5);
  });

  it('groups records by day with daily totals', () => {
    const groups = groupSessionsByDay(sessions);
    expect(groups).toHaveLength(2);
    expect(groups[0].durationMs).toBe(45 * 60_000);
  });

  it('assigns heatmap intensity levels', () => {
    const heatmap = buildHeatmap(sessions, start + DAY_MS, 2);
    expect(heatmap[0].level).toBe(4);
    expect(heatmap[1].level).toBe(4);
  });
});

