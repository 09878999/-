import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import type { StudySession, Subject } from '../types';
import { formatDateHeading, formatDuration, formatTime, startOfDay } from '../lib/time';
import { groupSessionsByDay } from '../lib/stats';

interface RecordsPageProps {
  subjects: Subject[];
  sessions: StudySession[];
  onAdd: () => void;
  onEdit: (session: StudySession) => void;
  onDelete: (session: StudySession) => void;
}

export function RecordsPage({ subjects, sessions, onAdd, onEdit, onDelete }: RecordsPageProps) {
  const todayStart = startOfDay(Date.now());
  const todaySessions = sessions.filter((session) => session.startedAt >= todayStart);
  const todayDuration = todaySessions.reduce((total, session) => total + session.durationMs, 0);
  const groups = groupSessionsByDay(sessions);

  return (
    <div className="records-page page-enter">
      <header className="page-heading records-heading">
        <div>
          <p className="eyebrow">学习记录</p>
          <h1>每一段投入，都有迹可循。</h1>
        </div>
        <button type="button" className="button button-primary" onClick={onAdd}>
          <Plus size={18} /> 补记一笔
        </button>
      </header>

      <section className="record-summary">
        <div>
          <span className="eyebrow">今日总计</span>
          <strong>{todayDuration ? formatDuration(todayDuration) : '0 分钟'}</strong>
        </div>
        <div className="summary-divider" />
        <div>
          <span className="eyebrow">今日段数</span>
          <strong>{todaySessions.length}<small> 段</small></strong>
        </div>
        <div className="summary-note">
          <CalendarDays size={18} />
          <span>按真实学习时长统计</span>
        </div>
      </section>

      {groups.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon"><CalendarDays size={24} /></div>
          <h2>还没有学习记录</h2>
          <p>开始一段专注，或手动补记之前的学习时间。</p>
          <button type="button" className="button button-secondary" onClick={onAdd}>
            <Plus size={18} /> 补记第一笔
          </button>
        </section>
      ) : (
        <div className="record-groups">
          {groups.map((group) => (
            <section className="record-day" key={group.date}>
              <header className="record-day-heading">
                <div>
                  <h2>{formatDateHeading(group.date)}</h2>
                  <span>{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(group.date)}</span>
                </div>
                <strong>{formatDuration(group.durationMs)}</strong>
              </header>
              <div className="record-list">
                {group.sessions.map((session) => {
                  const subject = subjects.find((item) => item.id === session.subjectId);
                  return (
                    <article className="record-row" key={session.id}>
                      <span className="record-subject-mark" style={{ backgroundColor: subject?.color ?? '#8d969e' }} />
                      <div className="record-subject">
                        <strong>{subject?.name ?? '已删除科目'}</strong>
                        <span>{formatTime(session.startedAt)}</span>
                      </div>
                      <time className="record-duration">{formatDuration(session.durationMs)}</time>
                      <div className="record-actions">
                        <button type="button" className="icon-button" aria-label="编辑记录" onClick={() => onEdit(session)}>
                          <Pencil size={17} />
                        </button>
                        <button type="button" className="icon-button danger-icon" aria-label="删除记录" onClick={() => onDelete(session)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
