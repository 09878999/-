import { describe, expect, it } from 'vitest';
import { readTimerAnimation, saveTimerAnimation, TIMER_ANIMATION_STORAGE_KEY } from '../lib/preferences';

describe('timer animation preference', () => {
  it('defaults to the soft animation', () => {
    expect(readTimerAnimation()).toBe('soft');
  });

  it('saves a valid animation preference', () => {
    saveTimerAnimation('flip');
    expect(localStorage.getItem(TIMER_ANIMATION_STORAGE_KEY)).toBe('flip');
    expect(readTimerAnimation()).toBe('flip');
  });

  it('falls back safely when stored data is invalid', () => {
    localStorage.setItem(TIMER_ANIMATION_STORAGE_KEY, 'spin');
    expect(readTimerAnimation()).toBe('soft');
  });
});
