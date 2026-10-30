import { useState } from 'react';
import { Check, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import type { Goal } from '../types';
import { formatShortDate } from '../lib/time';
import { ConfirmDialog } from './Modal';
import { GoalForm } from './GoalForm';

interface GoalsPageProps {
  goals: Goal[];
  onAdd: (text: string) => Promise<Goal>;
  onUpdate: (id: string, text: string) => Promise<void>;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function GoalsPage({ goals, onAdd, onUpdate, onToggle, onDelete }: GoalsPageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [goalToDelete, setGoalToDelete] = useState<Goal | undefined>();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeGoals = goals.filter((goal) => !goal.completed);
  const completedGoals = goals.filter((goal) => goal.completed);
  const orderedGoals = [...activeGoals, ...completedGoals];

  function openAddForm() {
    setEditingGoal(undefined);
    setFormOpen(true);
  }

  function openEditForm(goal: Goal) {
    setEditingGoal(goal);
    setFormOpen(true);
  }

  async function handleSubmit(text: string) {
    if (editingGoal) await onUpdate(editingGoal.id, text);
    else await onAdd(text);
    setFormOpen(false);
    setEditingGoal(undefined);
  }

  async function handleToggle(goal: Goal) {
    setTogglingId(goal.id);
    try {
      await onToggle(goal.id, !goal.completed);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!goalToDelete) return;
    await onDelete(goalToDelete.id);
    setGoalToDelete(undefined);
  }

  return (
    <div className="goals-page page-enter">
      <header className="page-heading goals-heading">
        <div>
          <p className="eyebrow">目标</p>
          <h1>把想抵达的地方，写下来。</h1>
        </div>
        <button type="button" className="button button-primary" onClick={openAddForm}>
          <Plus size={18} /> 添加目标
        </button>
      </header>

      <section className="goal-summary">
        <div className="goal-summary-mark"><Target size={23} /></div>
        <div className="goal-summary-copy">
          <span className="eyebrow">当前进度</span>
          <strong>{activeGoals.length}<small> 个进行中</small></strong>
        </div>
        <div className="goal-summary-stat">
          <span>已经完成</span>
          <strong>{completedGoals.length}</strong>
        </div>
        <p>目标不需要急着完成，先把方向放在看得见的地方。</p>
      </section>

      {orderedGoals.length === 0 ? (
        <section className="goal-empty">
          <div className="empty-icon"><Target size={25} /></div>
          <h2>还没有设置目标</h2>
          <p>手动写下你正在努力的方向，例如雅思 7.0、通过英语四级或 GPA 80+。</p>
          <button type="button" className="button button-secondary" onClick={openAddForm}>
            <Plus size={18} /> 写下第一个目标
          </button>
        </section>
      ) : (
        <div className="goal-board">
          {orderedGoals.map((goal, index) => (
            <article className={`goal-card${goal.completed ? ' is-completed' : ''}`} key={goal.id}>
              <div className="goal-card-top">
                <span className="goal-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="goal-card-actions">
                  <button type="button" className="icon-button" aria-label="编辑目标" onClick={() => openEditForm(goal)}>
                    <Pencil size={17} />
                  </button>
                  <button type="button" className="icon-button danger-icon" aria-label="删除目标" onClick={() => setGoalToDelete(goal)}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`goal-check${goal.completed ? ' is-checked' : ''}`}
                aria-label={goal.completed ? '标记为未完成' : '标记为已完成'}
                onClick={() => void handleToggle(goal)}
                disabled={togglingId === goal.id}
              >
                {goal.completed && <Check size={15} strokeWidth={2.5} />}
              </button>

              <p className="goal-text">{goal.text}</p>
              <footer className="goal-card-footer">
                <span>{goal.completed ? '已经完成' : '正在努力'}</span>
                <time>{formatShortDate(goal.createdAt)} 写下</time>
              </footer>
            </article>
          ))}
        </div>
      )}

      {formOpen && (
        <GoalForm
          key={editingGoal?.id ?? 'new-goal'}
          open
          goal={editingGoal}
          onClose={() => {
            setFormOpen(false);
            setEditingGoal(undefined);
          }}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={Boolean(goalToDelete)}
        title="删除这个目标？"
        description="删除后无法恢复，不会影响学习记录。"
        confirmLabel="删除目标"
        danger
        onClose={() => setGoalToDelete(undefined)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
