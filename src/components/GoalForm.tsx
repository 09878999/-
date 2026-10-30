import { useState } from 'react';
import { Target } from 'lucide-react';
import type { Goal } from '../types';
import { Modal } from './Modal';

interface GoalFormProps {
  open: boolean;
  goal?: Goal;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}

const EXAMPLES = ['雅思 7.0', '通过英语四级', 'GPA 80+'];

export function GoalForm({ open, goal, onClose, onSubmit }: GoalFormProps) {
  const [text, setText] = useState(goal?.text ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(goal);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      setError('请输入目标内容。');
      return;
    }
    if (value.length > 120) {
      setError('目标内容不能超过 120 个字符。');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSubmit(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试。');
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      title={isEditing ? '编辑目标' : '写下你的目标'}
      eyebrow={isEditing ? '调整方向' : '新的方向'}
      onClose={onClose}
      className="goal-modal"
    >
      <form className="goal-form" onSubmit={handleSubmit}>
        <div className="goal-form-icon"><Target size={22} /></div>
        <label className="goal-field">
          <span className="field-label">目标内容</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="例如：雅思 7.0、通过英语四级、GPA 80+"
            maxLength={120}
            rows={4}
            autoFocus
            disabled={saving}
            aria-label="目标内容"
          />
          <small>{text.length} / 120</small>
        </label>

        {!isEditing && (
          <div className="goal-examples">
            <span>可以这样写</span>
            <div>
              {EXAMPLES.map((example) => (
                <button type="button" key={example} onClick={() => setText(example)} disabled={saving}>
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="button button-ghost" onClick={onClose} disabled={saving}>取消</button>
          <button type="submit" className="button button-primary" disabled={saving || !text.trim()}>
            {saving ? '保存中…' : isEditing ? '保存修改' : '添加目标'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
