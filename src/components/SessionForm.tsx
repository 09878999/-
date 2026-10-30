import { useState } from 'react';
import { Clock3, Trash2 } from 'lucide-react';
import type { StudySession, Subject } from '../types';
import { formatTime, fromDateTimeInputs, roundMinutes, toDateInputValue, toTimeInputValue } from '../lib/time';
import { Modal } from './Modal';
import { SubjectPills } from './SubjectPills';

export type SessionFormMode = 'finish' | 'create' | 'edit';

export interface SessionFormValue {
  id?: string;
  subjectId: string;
  startedAt: number;
  durationMs: number;
}

interface SessionFormProps {
  open: boolean;
  mode: SessionFormMode;
  initial: SessionFormValue;
  subjects: Subject[];
  onClose: () => void;
  onSubmit: (value: SessionFormValue) => Promise<void>;
  onDelete?: (session: StudySession) => void;
  originalSession?: StudySession;
}

const COPY = {
  finish: { eyebrow: '本次专注', title: '记录这段专注', action: '保存记录' },
  create: { eyebrow: '手动补记', title: '补记学习时长', action: '添加记录' },
  edit: { eyebrow: '修改记录', title: '编辑学习记录', action: '保存修改' },
} as const;

export function SessionForm({
  open,
  mode,
  initial,
  subjects,
  onClose,
  onSubmit,
  onDelete,
  originalSession,
}: SessionFormProps) {
  const initialMinutes = roundMinutes(initial.durationMs);
  const [subjectId, setSubjectId] = useState(initial.subjectId || subjects[0]?.id || '');
  const [minutes, setMinutes] = useState(String(initialMinutes));
  const [dateValue, setDateValue] = useState(toDateInputValue(initial.startedAt));
  const [timeValue, setTimeValue] = useState(toTimeInputValue(initial.startedAt));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const copy = COPY[mode];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const durationMinutes = Number(minutes);
    if (!subjectId) {
      setError('请选择一个科目。');
      return;
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440) {
      setError('时长需在 1 到 1440 分钟之间。');
      return;
    }

    const durationMs = Math.round(durationMinutes) * 60_000;
    const startedAt = mode === 'finish'
      ? Date.now() - durationMs
      : fromDateTimeInputs(dateValue, timeValue);
    if (!Number.isFinite(startedAt)) {
      setError('请选择有效的日期和时间。');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit({ ...initial, subjectId, startedAt, durationMs });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试。');
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={copy.title} eyebrow={copy.eyebrow} onClose={onClose} className="session-modal">
      <form onSubmit={handleSubmit} className="session-form">
        <div className="form-section">
          <label className="field-label">学习科目</label>
          <SubjectPills subjects={subjects} value={subjectId} onChange={setSubjectId} disabled={saving} />
        </div>

        <div className="form-section form-grid">
          <label className="field">
            <span className="field-label">学习时长</span>
            <span className="input-with-suffix">
              <input
                type="number"
                min="1"
                max="1440"
                step="1"
                inputMode="numeric"
                aria-label="学习时长"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                disabled={saving}
                required
              />
              <span>分钟</span>
            </span>
          </label>

          {mode !== 'finish' && (
            <>
              <label className="field">
                <span className="field-label">日期</span>
                <input type="date" value={dateValue} onChange={(event) => setDateValue(event.target.value)} disabled={saving} required />
              </label>
              <label className="field">
                <span className="field-label">开始时间</span>
                <input type="time" value={timeValue} onChange={(event) => setTimeValue(event.target.value)} disabled={saving} required />
              </label>
            </>
          )}
        </div>

        {mode === 'finish' && (
          <div className="finish-hint">
            <Clock3 size={16} />
            <span>约 {formatTime(Date.now() - Number(minutes || 0) * 60_000)} 开始 · 可随时调整时长</span>
          </div>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="modal-actions spread">
          {mode === 'edit' && originalSession && onDelete ? (
            <button type="button" className="text-button danger-text" onClick={() => onDelete(originalSession)} disabled={saving}>
              <Trash2 size={16} /> 删除记录
            </button>
          ) : <span />}
          <div className="action-group">
            <button type="button" className="button button-ghost" onClick={onClose} disabled={saving}>取消</button>
            <button type="submit" className="button button-primary" disabled={saving || subjects.length === 0}>
              {saving ? '保存中…' : copy.action}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

