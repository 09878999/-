import { useEffect, useMemo, useState } from 'react';
import { getElapsedMs } from '../lib/time';
import type { ActiveSession } from '../types';

const STORAGE_KEY = 'still-focus-active-session-v1';

function readStoredSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ActiveSession>;
    if (
      typeof value.subjectId !== 'string' ||
      typeof value.startedAt !== 'number' ||
      typeof value.accumulatedMs !== 'number' ||
      (value.resumedAt !== null && typeof value.resumedAt !== 'number')
    ) {
      return null;
    }
    return value as ActiveSession;
  } catch {
    return null;
  }
}

interface WakeLockLike {
  release: () => Promise<void>;
}

export function useFocusTimer() {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(readStoredSession);
  const [now, setNow] = useState(Date.now);

  const running = activeSession?.resumedAt !== null;

  useEffect(() => {
    if (activeSession) localStorage.setItem(STORAGE_KEY, JSON.stringify(activeSession));
    else localStorage.removeItem(STORAGE_KEY);
  }, [activeSession]);

  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 1000);
    const handleVisibility = () => tick();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [running]);

  useEffect(() => {
    if (!running || !('wakeLock' in navigator)) return;
    let lock: WakeLockLike | null = null;
    let cancelled = false;
    const wakeLock = (navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockLike> } }).wakeLock;
    wakeLock
      ?.request('screen')
      .then((nextLock) => {
        if (cancelled) void nextLock.release();
        else lock = nextLock;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (lock) void lock.release().catch(() => undefined);
    };
  }, [running]);

  const elapsedMs = useMemo(
    () => (activeSession ? getElapsedMs(activeSession, now) : 0),
    [activeSession, now],
  );

  function start(subjectId: string) {
    const timestamp = Date.now();
    setNow(timestamp);
    setActiveSession({
      subjectId,
      startedAt: timestamp,
      accumulatedMs: 0,
      resumedAt: timestamp,
    });
  }

  function pause() {
    if (!activeSession || activeSession.resumedAt === null) return;
    const timestamp = Date.now();
    setNow(timestamp);
    setActiveSession({
      ...activeSession,
      accumulatedMs: getElapsedMs(activeSession, timestamp),
      resumedAt: null,
    });
  }

  function resume() {
    if (!activeSession || activeSession.resumedAt !== null) return;
    const timestamp = Date.now();
    setNow(timestamp);
    setActiveSession({ ...activeSession, resumedAt: timestamp });
  }

  function discard() {
    setActiveSession(null);
    setNow(Date.now());
  }

  return { activeSession, elapsedMs, running, start, pause, resume, discard };
}
