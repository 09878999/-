import { formatTimer } from '../lib/time';
import type { TimerAnimation } from '../types';

interface AnimatedTimerProps {
  elapsedMs: number;
  animation: TimerAnimation;
  className?: string;
}

export function AnimatedTimer({ elapsedMs, animation, className = '' }: AnimatedTimerProps) {
  const value = formatTimer(elapsedMs);
  return (
    <div
      className={`timer-display digit-animation-${animation} ${className}`.trim()}
      aria-label={`已专注 ${value}`}
      data-animation={animation}
    >
      {value.split('').map((character, index) => (
        <span
          key={`${index}-${character}`}
          className={`timer-glyph${character === ':' ? ' is-colon' : ''}`}
          aria-hidden="true"
        >
          {character}
        </span>
      ))}
    </div>
  );
}
