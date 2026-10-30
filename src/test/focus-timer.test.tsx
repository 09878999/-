import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFocusTimer } from '../hooks/useFocusTimer';

describe('useFocusTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 31, 9, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts real time, excludes pauses, and recovers from storage', () => {
    const first = renderHook(() => useFocusTimer());
    act(() => first.result.current.start('math'));
    act(() => vi.advanceTimersByTime(61_000));
    expect(first.result.current.elapsedMs).toBe(61_000);

    act(() => first.result.current.pause());
    act(() => vi.advanceTimersByTime(30_000));
    expect(first.result.current.elapsedMs).toBe(61_000);

    act(() => first.result.current.resume());
    act(() => vi.advanceTimersByTime(4_000));
    expect(first.result.current.elapsedMs).toBe(65_000);

    first.unmount();
    const second = renderHook(() => useFocusTimer());
    expect(second.result.current.activeSession?.subjectId).toBe('math');
    expect(second.result.current.elapsedMs).toBeGreaterThanOrEqual(65_000);
  });
});
