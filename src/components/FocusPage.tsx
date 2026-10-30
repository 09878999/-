import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Square,
  TimerReset,
  Trash2,
} from 'lucide-react';
import type { ActiveSession, StudySession, Subject, TimerAnimation } from '../types';
import { formatDuration, formatTime, startOfDay } from '../lib/time';
import { AnimatedTimer } from './AnimatedTimer';
import { SubjectPills } from './SubjectPills';

interface FocusPageProps {
  subjects: Subject[];
  sessions: StudySession[];
  activeSession: ActiveSession | null;
  elapsedMs: number;
  running: boolean;
  timerAnimation: TimerAnimation;
  onStart: (subjectId: string) => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onDiscard: () => void;
}

interface ImmersiveFocusProps {
  subject?: Subject;
  elapsedMs: number;
  running: boolean;
  timerAnimation: TimerAnimation;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onDiscard: () => void;
  onExit: () => void;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

function ImmersiveFocus({
  subject,
  elapsedMs,
  running,
  timerAnimation,
  onPause,
  onResume,
  onFinish,
  onDiscard,
  onExit,
}: ImmersiveFocusProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onExit();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExit]);

  return (
    <section className="immersive-focus" aria-label="全屏专注模式" data-testid="immersive-focus">
      <div className="immersive-glow immersive-glow-one" />
      <div className="immersive-glow immersive-glow-two" />

      <header className="immersive-header">
        <div className="immersive-brand">
          <div className="brand-mark"><span /></div>
          <span>静时</span>
        </div>
        <div className={`immersive-status${running ? ' is-running' : ''}`}>
          <span className="status-dot" />
          {running ? '正在专注' : '已暂停'}
        </div>
        <button type="button" className="immersive-exit" onClick={onExit} aria-label="退出全屏，继续计时">
          <Minimize2 size={18} />
          <span>退出全屏</span>
        </button>
      </header>

      <div className="immersive-center">
        <div className="immersive-subject">
          <span className="subject-dot" style={{ backgroundColor: subject?.color ?? '#8d969e' }} />
          {subject?.name ?? '专注'}
        </div>
        <p className="immersive-caption">把注意力留在此刻</p>
        <AnimatedTimer elapsedMs={elapsedMs} animation={timerAnimation} className="immersive-timer" />
      </div>

      <footer className="immersive-footer">
        <div className="immersive-actions">
          <button type="button" className="immersive-action secondary" onClick={running ? onPause : onResume}>
            {running ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            {running ? '暂停' : '继续'}
          </button>
          <button type="button" className="immersive-action primary" onClick={onFinish} disabled={elapsedMs < 1000}>
            <Square size={19} fill="currentColor" />
            结束并记录
          </button>
        </div>
        <button type="button" className="immersive-discard" onClick={onDiscard}>
          <Trash2 size={14} /> 放弃本次
        </button>
        <p className="immersive-hint">真实时间计时 · 暂停不计入时长</p>
      </footer>
    </section>
  );
}

export function FocusPage({
  subjects,
  sessions,
  activeSession,
  elapsedMs,
  running,
  timerAnimation,
  onStart,
  onPause,
  onResume,
  onFinish,
  onDiscard,
}: FocusPageProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(activeSession?.subjectId ?? subjects[0]?.id ?? '');
  const [immersive, setImmersive] = useState(false);
  const exitImmersive = useCallback(() => setImmersive(false), []);

  useEffect(() => {
    if (activeSession) setSelectedSubjectId(activeSession.subjectId);
  }, [activeSession]);

  useEffect(() => {
    if (!subjects.some((subject) => subject.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0]?.id ?? '');
    }
  }, [selectedSubjectId, subjects]);

  useEffect(() => {
    if (!activeSession) setImmersive(false);
  }, [activeSession]);

  const todayStart = startOfDay(Date.now());
  const todaySessions = sessions.filter((session) => session.startedAt >= todayStart);
  const todayDuration = todaySessions.reduce((total, session) => total + session.durationMs, 0);
  const selectedSubject = subjects.find((subject) => subject.id === (activeSession?.subjectId ?? selectedSubjectId));
  const hasActiveSession = Boolean(activeSession);

  function beginFocus() {
    if (!selectedSubjectId) return;
    onStart(selectedSubjectId);
    setImmersive(true);
  }

  return (
    <>
      <div className="focus-layout page-enter">
        <section className="focus-primary">
          <header className="page-heading compact-heading">
            <div>
              <p className="eyebrow">{greeting()}</p>
              <h1>留一点时间，只做一件事。</h1>
            </div>
            <span className="date-caption">
              {new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(Date.now())}
            </span>
          </header>

          <div className={`timer-card${hasActiveSession ? ' is-active' : ''}`}>
            <div className="timer-orb timer-orb-one" />
            <div className="timer-orb timer-orb-two" />

            <div className="timer-topline">
              <span className={`status-pill${running ? ' is-running' : ''}`}>
                <span className="status-dot" />
                {hasActiveSession ? (running ? '正在专注' : '已暂停') : '准备开始'}
              </span>
              <div className="timer-top-meta">
                {selectedSubject && hasActiveSession && (
                  <span className="active-subject">
                    <span className="subject-dot" style={{ backgroundColor: selectedSubject.color }} />
                    {selectedSubject.name}
                  </span>
                )}
                {hasActiveSession && (
                  <button
                    type="button"
                    className="fullscreen-button"
                    onClick={() => setImmersive(true)}
                    aria-label="进入全屏专注"
                  >
                    <Maximize2 size={15} />
                    <span>全屏</span>
                  </button>
                )}
              </div>
            </div>

            <AnimatedTimer elapsedMs={hasActiveSession ? elapsedMs : 0} animation={timerAnimation} />

            {!hasActiveSession ? (
              <div className="timer-idle-controls">
                <p className="timer-prompt">选择科目，开始记录</p>
                {subjects.length > 0 ? (
                  <SubjectPills subjects={subjects} value={selectedSubjectId} onChange={setSelectedSubjectId} />
                ) : (
                  <p className="form-error">请先在设置中添加一个学习科目。</p>
                )}
                <button
                  type="button"
                  className="start-button"
                  onClick={beginFocus}
                  disabled={!selectedSubjectId}
                >
                  <Play size={20} fill="currentColor" />
                  开始专注
                </button>
              </div>
            ) : (
              <div className="timer-active-controls">
                <div className="timer-actions">
                  <button type="button" className="round-action secondary-action" onClick={running ? onPause : onResume}>
                    {running ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                    <span>{running ? '暂停' : '继续'}</span>
                  </button>
                  <button type="button" className="round-action primary-action" onClick={onFinish} disabled={elapsedMs < 1000}>
                    <Square size={20} fill="currentColor" />
                    <span>结束并记录</span>
                  </button>
                </div>
                <button type="button" className="quiet-danger" onClick={onDiscard}>
                  <Trash2 size={15} /> 放弃本次
                </button>
              </div>
            )}
          </div>

          <div className="focus-notes">
            <span><TimerReset size={16} /> 计时以真实时间计算，暂停不计入时长</span>
            <span>数据仅保存在这台 iPad</span>
          </div>
        </section>

        <aside className="focus-sidebar">
          <section className="surface today-card">
            <div className="surface-heading">
              <span className="eyebrow">今日累积</span>
              <span className="tiny-count">{todaySessions.length} 段专注</span>
            </div>
            <strong className="today-total">{todayDuration ? formatDuration(todayDuration) : '尚未开始'}</strong>
            <div className="today-rule" />
            {todaySessions.length > 0 ? (
              <div className="today-list">
                {todaySessions.slice(0, 4).map((session) => {
                  const subject = subjects.find((item) => item.id === session.subjectId);
                  return (
                    <div className="today-row" key={session.id}>
                      <span className="subject-dot" style={{ backgroundColor: subject?.color ?? '#8d969e' }} />
                      <div>
                        <span>{subject?.name ?? '已删除科目'}</span>
                        <small>{formatTime(session.startedAt)}</small>
                      </div>
                      <time>{formatDuration(session.durationMs)}</time>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-copy">今天的第一段专注，还没有开始。</p>
            )}
          </section>

          <section className="quote-card">
            <span className="quote-mark">“</span>
            <p>专注不是把时间填满，<br />而是把注意力放在一处。</p>
            <span className="quote-line" />
          </section>
        </aside>
      </div>

      {immersive && activeSession && createPortal(
        <ImmersiveFocus
          subject={selectedSubject}
          elapsedMs={elapsedMs}
          running={running}
          timerAnimation={timerAnimation}
          onPause={onPause}
          onResume={onResume}
          onFinish={onFinish}
          onDiscard={onDiscard}
          onExit={exitImmersive}
        />,
        document.body,
      )}
    </>
  );
}
