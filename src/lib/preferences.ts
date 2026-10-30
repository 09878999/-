import type { TimerAnimation } from '../types';

export const TIMER_ANIMATION_STORAGE_KEY = 'still-focus-timer-animation-v1';

export const TIMER_ANIMATION_OPTIONS: Array<{
  id: TimerAnimation;
  label: string;
  description: string;
}> = [
  { id: 'soft', label: '轻落', description: '柔和上浮' },
  { id: 'sweep', label: '滑入', description: '横向轻滑' },
  { id: 'pulse', label: '呼吸', description: '轻微缩放' },
  { id: 'none', label: '静止', description: '不播放动画' },
];

const VALID_ANIMATIONS = new Set<TimerAnimation>(TIMER_ANIMATION_OPTIONS.map((option) => option.id));

export function readTimerAnimation(): TimerAnimation {
  try {
    const value = localStorage.getItem(TIMER_ANIMATION_STORAGE_KEY) as TimerAnimation | null;
    return value && VALID_ANIMATIONS.has(value) ? value : 'soft';
  } catch {
    return 'soft';
  }
}

export function saveTimerAnimation(animation: TimerAnimation) {
  try {
    localStorage.setItem(TIMER_ANIMATION_STORAGE_KEY, animation);
  } catch {
    // Private browsing can reject storage; the current session still applies.
  }
}
