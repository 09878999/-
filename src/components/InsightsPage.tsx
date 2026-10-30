import { useMemo, useState } from 'react';
import { BarChart3, Flame, History } from 'lucide-react';
import type { StudySession, Subject } from '../types';
import {
  addDays,
  formatDuration,
  formatDurationShort,
  formatShortDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from '../lib/time';
import { buildDailySeries, buildHeatmap, buildSubjectTotals, sessionsInRange, totalDuration } from '../lib/stats';

interface InsightsPageProps {
  subjects: Subject[];
  sessions: StudySession[];
}

type Period = 7 | 30;

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function InsightsPage({ subjects, sessions }: InsightsPageProps) {
  const [period, setPeriod] = useState<Period>(7);
  const now = Date.now();
  const rangeStart = startOfDay(addDays(now, -(period - 1)));
  const rangeSessions = sessionsInRange(sessions, rangeStart, now);
  const rangeTotal = totalDuration(rangeSessions);
  const dailySeries = buildDailySeries(sessions, now, period);
  const maxDaily = Math.max(...dailySeries.map((day) => day.durationMs), 1);
  const subjectTotals = buildSubjectTotals(rangeSessions, subjects);
  const todayTotal = totalDuration(sessionsInRange(sessions, startOfDay(now), now));
  const weekTotal = totalDuration(sessionsInRange(sessions, startOfWeek(now), now));
  const monthTotal = totalDuration(sessionsInRange(sessions, startOfMonth(now), now));
  const activeDays = dailySeries.filter((day) => day.durationMs > 0).length;
  const average = activeDays ? rangeTotal / activeDays : 0;

  const heatmapEnd = startOfDay(addDays(startOfWeek(now), 6));
  const heatmap = useMemo(() => buildHeatmap(sessions, Math.max(heatmapEnd, startOfDay(now)), 84), [heatmapEnd, sessions]);
  const bestDay = dailySeries.reduce((best, day) => (day.durationMs > best.durationMs ? day : best), dailySeries[0]);

  return (
    <div className="insights-page page-enter">
      <header className="page-heading insights-heading">
        <div>
          <p className="eyebrow">专注回顾</p>
          <h1>看见时间留下的形状。</h1>
        </div>
        <div className="segmented-control" aria-label="统计周期">
          <button type="button" className={period === 7 ? 'is-active' : ''} onClick={() => setPeriod(7)}>近 7 天</button>
          <button type="button" className={period === 30 ? 'is-active' : ''} onClick={() => setPeriod(30)}>近 30 天</button>
        </div>
      </header>

      <section className="insight-grid">
        <article className="metric-card primary-metric">
          <span className="metric-icon"><History size={18} /></span>
          <span className="eyebrow">本期专注</span>
          <strong>{formatDuration(rangeTotal)}</strong>
          <p>{rangeSessions.length} 段学习记录</p>
        </article>
        <article className="metric-card">
          <span className="metric-icon"><Flame size={18} /></span>
          <span className="eyebrow">有学习的天数</span>
          <strong>{activeDays}<small> 天</small></strong>
          <p>日均 {formatDurationShort(average)}</p>
        </article>
        <article className="metric-card">
          <span className="metric-icon"><BarChart3 size={18} /></span>
          <span className="eyebrow">今日专注</span>
          <strong>{formatDuration(todayTotal)}</strong>
          <p>本周 {formatDurationShort(weekTotal)} · 本月 {formatDurationShort(monthTotal)}</p>
        </article>
      </section>

      <section className="surface chart-card">
        <header className="surface-heading chart-heading">
          <div>
            <span className="eyebrow">学习趋势</span>
            <h2>每天投入的时间</h2>
          </div>
          <span className="chart-peak">最高 {formatDurationShort(bestDay?.durationMs ?? 0)}</span>
        </header>
        <div className={`bar-chart${period === 30 ? ' is-dense' : ''}`} role="img" aria-label={`近 ${period} 天每日学习时长柱状图`}>
          {dailySeries.map((day, index) => {
            const height = day.durationMs ? Math.max(8, Math.round((day.durationMs / maxDaily) * 100)) : 2;
            const showLabel = period === 7 || index === 0 || index === dailySeries.length - 1 || index % 5 === 0;
            return (
              <div className="bar-column" key={day.date}>
                <div className="bar-track">
                  <div
                    className={`bar-fill${day.durationMs ? '' : ' is-empty'}`}
                    style={{ height: `${height}%` }}
                    title={`${formatShortDate(day.date)} ${formatDuration(day.durationMs)}`}
                  />
                </div>
                <span className="bar-label">
                  {showLabel ? (period === 7 ? WEEKDAYS[(new Date(day.date).getDay() + 6) % 7] : formatShortDate(day.date)) : ''}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="insights-lower-grid">
        <section className="surface subject-card">
          <header className="surface-heading">
            <div>
              <span className="eyebrow">科目分布</span>
              <h2>时间花在了哪里</h2>
            </div>
          </header>
          {subjectTotals.length > 0 ? (
            <div className="subject-breakdown">
              {subjectTotals.map(({ subject, durationMs, share }) => (
                <div className="subject-stat" key={subject.id}>
                  <div className="subject-stat-label">
                    <span className="subject-dot" style={{ backgroundColor: subject.color }} />
                    <span>{subject.name}</span>
                    <time>{formatDuration(durationMs)}</time>
                  </div>
                  <div className="subject-track">
                    <div className="subject-fill" style={{ width: `${Math.max(4, share * 100)}%`, backgroundColor: subject.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">这个周期还没有学习记录。</p>
          )}
        </section>

        <section className="surface heatmap-card">
          <header className="surface-heading">
            <div>
              <span className="eyebrow">近 12 周</span>
              <h2>专注节律</h2>
            </div>
            <div className="heatmap-legend">
              <span>少</span>
              {[0, 1, 2, 3, 4].map((level) => <i className={`heat-level-${level}`} key={level} />)}
              <span>多</span>
            </div>
          </header>
          <div className="heatmap-wrap">
            <div className="heatmap-weekdays">
              {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="heatmap-grid" role="img" aria-label="近 12 周学习热力图">
              {heatmap.map((day) => (
                <span
                  key={day.date}
                  className={`heat-cell heat-level-${day.level}`}
                  title={`${formatShortDate(day.date)} ${formatDuration(day.durationMs)}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

