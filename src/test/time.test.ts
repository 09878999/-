import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  formatTimer,
  fromDateTimeInputs,
  getElapsedMs,
  startOfWeek,
} from '../lib/time';

describe('time helpers', () => {
  it('calculates elapsed time for running and paused sessions', () => {
    expect(getElapsedMs({ accumulatedMs: 15_000, resumedAt: 1_000 }, 61_000)).toBe(75_000);
    expect(getElapsedMs({ accumulatedMs: 75_000, resumedAt: null }, 999_000)).toBe(75_000);
  });

  it('formats the timer as hours, minutes and seconds', () => {
    expect(formatTimer(0)).toBe('00:00:00');
    expect(formatTimer(3_661_000)).toBe('01:01:01');
  });

  it('formats human-readable durations', () => {
    expect(formatDuration(59_000)).toBe('1 分钟');
    expect(formatDuration(25 * 60_000)).toBe('25 分钟');
    expect(formatDuration(125 * 60_000)).toBe('2 小时 5 分钟');
  });

  it('starts weeks on Monday', () => {
    const sunday = new Date(2026, 9, 25, 12).getTime();
    expect(new Date(startOfWeek(sunday)).getDay()).toBe(1);
  });

  it('turns date and time inputs into a local timestamp', () => {
    const timestamp = fromDateTimeInputs('2026-10-31', '09:30');
    const date = new Date(timestamp);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(31);
    expect(date.getHours()).toBe(9);
    expect(date.getMinutes()).toBe(30);
  });
});

