import { useState } from 'react';
import { BarChart3, BookOpen, Settings2, Target, Timer } from 'lucide-react';
import { BrandMark } from './components/BrandMark';
import { FocusPage } from './components/FocusPage';
import { GoalsPage } from './components/GoalsPage';
import { InsightsPage } from './components/InsightsPage';
import { RecordsPage } from './components/RecordsPage';
import { ConfirmDialog } from './components/Modal';
import { SessionForm, type SessionFormMode, type SessionFormValue } from './components/SessionForm';
import { SettingsPanel } from './components/SettingsPanel';
import { useFocusTimer } from './hooks/useFocusTimer';
import { useLearningData } from './hooks/useLearningData';
import { readTimerAnimation, saveTimerAnimation } from './lib/preferences';
import type { StudySession, Tab, TimerAnimation } from './types';
import { roundMinutes } from './lib/time';

interface FormDialogState {
  mode: SessionFormMode;
  initial: SessionFormValue;
  originalSession?: StudySession;
}

const NAV_ITEMS: Array<{ tab: Tab; label: string; icon: typeof Timer }> = [
  { tab: 'focus', label: '专注', icon: Timer },
  { tab: 'records', label: '记录', icon: BookOpen },
  { tab: 'goals', label: '目标', icon: Target },
  { tab: 'insights', label: '统计', icon: BarChart3 },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('focus');
  const [timerAnimation, setTimerAnimation] = useState<TimerAnimation>(readTimerAnimation);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formDialog, setFormDialog] = useState<FormDialogState | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<StudySession | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const timer = useFocusTimer();
  const data = useLearningData();

  const defaultSubjectId = timer.activeSession?.subjectId ?? data.subjects[0]?.id ?? '';

  function updateTimerAnimation(animation: TimerAnimation) {
    saveTimerAnimation(animation);
    setTimerAnimation(animation);
  }

  function openFinishDialog() {
    if (!timer.activeSession) return;
    setFormDialog({
      mode: 'finish',
      initial: {
        subjectId: timer.activeSession.subjectId,
        startedAt: timer.activeSession.startedAt,
        durationMs: timer.elapsedMs,
      },
    });
  }

  function openManualDialog() {
    const now = Date.now();
    setFormDialog({
      mode: 'create',
      initial: {
        subjectId: defaultSubjectId,
        startedAt: now,
        durationMs: 25 * 60_000,
      },
    });
  }

  function openEditDialog(session: StudySession) {
    setFormDialog({
      mode: 'edit',
      initial: {
        id: session.id,
        subjectId: session.subjectId,
        startedAt: session.startedAt,
        durationMs: session.durationMs,
      },
      originalSession: session,
    });
  }

  async function handleFormSubmit(value: SessionFormValue) {
    if (!formDialog) return;
    if (formDialog.mode === 'finish') {
      await data.addSession({
        subjectId: value.subjectId,
        startedAt: value.startedAt,
        durationMs: value.durationMs,
      });
      timer.discard();
    } else if (formDialog.mode === 'edit' && value.id) {
      await data.updateSession(value.id, {
        subjectId: value.subjectId,
        startedAt: value.startedAt,
        durationMs: value.durationMs,
      });
    } else {
      await data.addSession({
        subjectId: value.subjectId,
        startedAt: value.startedAt,
        durationMs: value.durationMs,
      });
    }
    setFormDialog(null);
  }

  function requestDelete(session: StudySession) {
    setFormDialog(null);
    setSessionToDelete(session);
  }

  async function confirmDeleteSession() {
    if (!sessionToDelete) return;
    await data.deleteSession(sessionToDelete.id);
    setSessionToDelete(null);
  }

  if (data.loading) {
    return (
      <div className="app-loading">
        <BrandMark />
        <p>正在整理你的专注空间</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="app-loading app-error">
        <BrandMark />
        <h1>无法读取本地数据</h1>
        <p>{data.error}</p>
        <button type="button" className="button button-secondary" onClick={() => window.location.reload()}>重新加载</button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">
          <BrandMark />
          <div className="brand-copy">
            <strong>静时</strong>
            <small>STILL FOCUS</small>
          </div>
        </div>

        <nav className="side-nav" aria-label="主导航">
          {NAV_ITEMS.map(({ tab: itemTab, label, icon: Icon }) => (
            <button
              type="button"
              key={itemTab}
              className={`nav-item${tab === itemTab ? ' is-active' : ''}`}
              onClick={() => setTab(itemTab)}
              aria-current={tab === itemTab ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={1.7} />
              <span className="nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="local-status">
            <span className="status-dot" />
            <span>本地存储</span>
          </div>
          <button type="button" className="nav-item sidebar-settings" onClick={() => setSettingsOpen(true)}>
            <Settings2 size={20} strokeWidth={1.7} />
            <span className="nav-label">设置</span>
          </button>
        </div>
      </aside>

      <main className="app-main">
        {tab === 'focus' && (
          <FocusPage
            subjects={data.subjects}
            sessions={data.sessions}
            activeSession={timer.activeSession}
            elapsedMs={timer.elapsedMs}
            running={timer.running}
            timerAnimation={timerAnimation}
            onStart={timer.start}
            onPause={timer.pause}
            onResume={timer.resume}
            onFinish={openFinishDialog}
            onDiscard={() => setConfirmDiscard(true)}
          />
        )}
        {tab === 'records' && (
          <RecordsPage
            subjects={data.subjects}
            sessions={data.sessions}
            onAdd={openManualDialog}
            onEdit={openEditDialog}
            onDelete={setSessionToDelete}
          />
        )}
        {tab === 'goals' && (
          <GoalsPage
            goals={data.goals}
            onAdd={data.addGoal}
            onUpdate={data.updateGoal}
            onToggle={data.toggleGoal}
            onDelete={data.deleteGoal}
          />
        )}
        {tab === 'insights' && <InsightsPage subjects={data.subjects} sessions={data.sessions} />}
      </main>

      {formDialog && (
        <SessionForm
          key={`${formDialog.mode}-${formDialog.initial.id ?? formDialog.initial.startedAt}-${formDialog.initial.durationMs}`}
          open
          mode={formDialog.mode}
          initial={formDialog.initial}
          subjects={data.subjects}
          originalSession={formDialog.originalSession}
          onClose={() => setFormDialog(null)}
          onSubmit={handleFormSubmit}
          onDelete={requestDelete}
        />
      )}

      <ConfirmDialog
        open={confirmDiscard}
        title="放弃本次专注？"
        description={`当前已经记录 ${roundMinutes(timer.elapsedMs)} 分钟，放弃后不会保存这段时长。`}
        confirmLabel="放弃并清空"
        danger
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => {
          timer.discard();
          setConfirmDiscard(false);
        }}
      />

      <ConfirmDialog
        open={Boolean(sessionToDelete)}
        title="删除这条记录？"
        description="删除后无法恢复，但不会影响其他学习记录。"
        confirmLabel="删除记录"
        danger
        onClose={() => setSessionToDelete(null)}
        onConfirm={() => void confirmDeleteSession()}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        subjects={data.subjects}
        sessions={data.sessions}
        goals={data.goals}
        onAddSubject={data.addSubject}
        onRenameSubject={data.renameSubject}
        onImportBackup={data.importBackup}
        onClearSessions={data.clearSessions}
        timerAnimation={timerAnimation}
        onTimerAnimationChange={updateTimerAnimation}
      />
    </div>
  );
}
