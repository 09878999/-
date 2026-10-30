import { useRef, useState } from 'react';
import { Check, Download, HardDrive, Plus, Settings2, Sparkles, Upload, X } from 'lucide-react';
import { backupFilename, createBackup, parseBackup } from '../lib/backup';
import { TIMER_ANIMATION_OPTIONS } from '../lib/preferences';
import type { BackupData, StudySession, Subject, TimerAnimation } from '../types';
import { Modal } from './Modal';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  sessions: StudySession[];
  onAddSubject: (name: string) => Promise<Subject>;
  onRenameSubject: (id: string, name: string) => Promise<void>;
  onImportBackup: (backup: BackupData) => Promise<void>;
  onClearSessions: () => Promise<void>;
  timerAnimation: TimerAnimation;
  onTimerAnimationChange: (animation: TimerAnimation) => void;
}

export function SettingsPanel({
  open,
  onClose,
  subjects,
  sessions,
  onAddSubject,
  onRenameSubject,
  onImportBackup,
  onClearSessions,
  timerAnimation,
  onTimerAnimationChange,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newSubject, setNewSubject] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingBackup, setPendingBackup] = useState<{ data: BackupData; filename: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy, setBusy] = useState(false);

  const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  function resetFeedback() {
    setMessage('');
    setError('');
  }

  async function handleAddSubject(event: React.FormEvent) {
    event.preventDefault();
    resetFeedback();
    try {
      await onAddSubject(newSubject);
      setNewSubject('');
      setMessage('科目已添加。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败。');
    }
  }

  async function handleRename(id: string) {
    resetFeedback();
    try {
      await onRenameSubject(id, editingName);
      setEditingId(null);
      setMessage('科目名称已更新。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '修改失败。');
    }
  }

  function handleExport() {
    resetFeedback();
    const backup = createBackup(subjects, sessions);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = backupFilename();
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`已导出 ${sessions.length} 条学习记录。`);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    resetFeedback();
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const data = parseBackup(await file.text());
      setPendingBackup({ data, filename: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : '备份文件读取失败。');
    }
  }

  async function handleRestore() {
    if (!pendingBackup) return;
    setBusy(true);
    resetFeedback();
    try {
      await onImportBackup(pendingBackup.data);
      setPendingBackup(null);
      setMessage(`已从 ${pendingBackup.filename} 恢复备份。`);
    } catch {
      setError('恢复备份失败，原有数据没有被替换。');
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setMessage('');
      setError('');
      return;
    }
    setBusy(true);
    resetFeedback();
    try {
      await onClearSessions();
      setConfirmClear(false);
      setMessage('所有学习记录已清除，科目设置已保留。');
    } catch {
      setError('清除失败，请重试。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title="设置" eyebrow="偏好与数据" onClose={onClose} className="settings-modal">
      <div className="settings-content">
        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <h3>学习科目</h3>
              <p>用几个稳定的分类记录你的学习。</p>
            </div>
            <Settings2 size={18} />
          </div>

          <div className="settings-subjects">
            {subjects.map((subject) => (
              <div className="settings-subject-row" key={subject.id}>
                <span className="subject-dot" style={{ backgroundColor: subject.color }} />
                {editingId === subject.id ? (
                  <>
                    <input
                      className="inline-edit"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && void handleRename(subject.id)}
                      autoFocus
                    />
                    <button type="button" className="icon-button" aria-label="确认修改" onClick={() => void handleRename(subject.id)}>
                      <Check size={17} />
                    </button>
                    <button type="button" className="icon-button" aria-label="取消修改" onClick={() => setEditingId(null)}>
                      <X size={17} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="settings-subject-name">{subject.name}</span>
                    <button
                      type="button"
                      className="text-button subtle-text"
                      onClick={() => {
                        setEditingId(subject.id);
                        setEditingName(subject.name);
                      }}
                    >
                      编辑
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <form className="add-subject-form" onSubmit={handleAddSubject}>
            <input
              value={newSubject}
              onChange={(event) => setNewSubject(event.target.value)}
              placeholder="新增科目，例如：设计"
              maxLength={16}
              aria-label="新增科目名称"
            />
            <button type="submit" className="button button-secondary" disabled={!newSubject.trim()}>
              <Plus size={17} /> 添加
            </button>
          </form>
        </section>
        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <h3>数字动效</h3>
              <p>选择秒数变化时的数字呈现方式。</p>
            </div>
            <Sparkles size={18} />
          </div>

          <div className="animation-options" role="radiogroup" aria-label="数字跳动效果">
            {TIMER_ANIMATION_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={timerAnimation === option.id}
                className={`animation-option${timerAnimation === option.id ? ' is-selected' : ''}`}
                onClick={() => onTimerAnimationChange(option.id)}
              >
                <span className={`animation-preview preview-${option.id}`}>88:88</span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
          <p className="animation-note">设置会立即保存，并用于普通计时与全屏计时。</p>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <h3>数据备份</h3>
              <p>数据只在这台设备上。建议定期导出备份。</p>
            </div>
            <HardDrive size={18} />
          </div>

          <div className="backup-actions">
            <button type="button" className="backup-action" onClick={handleExport}>
              <span className="backup-icon"><Download size={19} /></span>
              <span>
                <strong>导出备份</strong>
                <small>下载完整 JSON 文件</small>
              </span>
            </button>
            <button type="button" className="backup-action" onClick={() => fileInputRef.current?.click()}>
              <span className="backup-icon"><Upload size={19} /></span>
              <span>
                <strong>恢复备份</strong>
                <small>用备份替换当前数据</small>
              </span>
            </button>
            <input ref={fileInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleFileChange} />
          </div>

          {pendingBackup && (
            <div className="restore-confirm">
              <div>
                <strong>确认恢复？</strong>
                <p>{pendingBackup.filename} 将替换当前所有科目和记录。</p>
              </div>
              <div className="action-group">
                <button type="button" className="button button-ghost" onClick={() => setPendingBackup(null)} disabled={busy}>取消</button>
                <button type="button" className="button button-primary" onClick={() => void handleRestore()} disabled={busy}>
                  {busy ? '恢复中…' : '确认恢复'}
                </button>
              </div>
            </div>
          )}

          <div className="danger-zone">
            <div>
              <strong>清除学习记录</strong>
              <p>保留科目，删除全部计时记录。此操作无法撤销。</p>
            </div>
            <button type="button" className={confirmClear ? 'button button-danger' : 'button button-ghost'} onClick={() => void handleClear()} disabled={busy}>
              {confirmClear ? '再次点击确认' : '清除记录'}
            </button>
          </div>
        </section>

        {!isStandalone && (
          <section className="install-tip">
            <span>安装到 iPad</span>
            <p>在 Safari 中点击分享按钮，选择“添加到主屏幕”，即可像 App 一样使用。</p>
          </section>
        )}

        {(message || error) && (
          <p className={`settings-feedback${error ? ' is-error' : ''}`} role="status">
            {error || message}
          </p>
        )}

        <footer className="settings-footer">
          <span>静时 · 本地自用版</span>
          <span>所有数据保存在本机</span>
        </footer>
      </div>
    </Modal>
  );
}
