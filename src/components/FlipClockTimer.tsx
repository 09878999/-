import { useEffect, useRef, useState } from 'react';

interface FlipUnitProps {
  value: string;
  label: string;
  unit: 'hour' | 'minute' | 'second';
}

function FlipUnit({ value, label, unit }: FlipUnitProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const displayRef = useRef(value);

  useEffect(() => {
    if (value === displayRef.current) return;
    setPreviousValue(displayRef.current);
    displayRef.current = value;
    setDisplayValue(value);
    setFlipping(true);
  }, [value]);

  useEffect(() => {
    if (!flipping) return;
    const finishTimer = window.setTimeout(() => setFlipping(false), 590);
    return () => window.clearTimeout(finishTimer);
  }, [flipping]);

  return (
    <div className={`flip-unit${flipping ? ' is-flipping' : ''}`} data-unit={unit}>
      <div className="flip-card" data-digits={displayValue.length} aria-hidden="true">
        <div className="flip-half is-top"><span>{displayValue}</span></div>
        <div className="flip-half is-bottom"><span>{displayValue}</span></div>

        {flipping && (
          <>
            <div className="flip-half is-top flip-old-top"><span>{previousValue}</span></div>
            <div className="flip-half is-bottom flip-old-bottom"><span>{previousValue}</span></div>
            <div className="flip-half is-bottom flip-new-bottom"><span>{displayValue}</span></div>
          </>
        )}

        <span className="flip-seam" />
      </div>
      <span className="flip-label" aria-hidden="true">{label}</span>
    </div>
  );
}

interface FlipClockTimerProps {
  elapsedMs: number;
  className?: string;
}

export function FlipClockTimer({ elapsedMs, className = '' }: FlipClockTimerProps) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const readable = `${hours}:${minutes}:${seconds}`;

  return (
    <div
      className={`flip-clock ${className}`.trim()}
      role="timer"
      aria-label={`已专注 ${readable}`}
      data-animation="flipclock"
    >
      <FlipUnit value={hours} label="HOUR" unit="hour" />
      <FlipUnit value={minutes} label="MIN" unit="minute" />
      <FlipUnit value={seconds} label="SEC" unit="second" />
    </div>
  );
}
