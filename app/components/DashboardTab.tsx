'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { getWeekDates, sumBy, formatMoney, toLocalISO, CAT_ICONS } from '@/lib/budget';

const PIE_COLORS = ['#0078d4','#106ebe','#2b88d8','#107c10','#ca5010','#038387','#8764b8','#d13438','#ffb900','#038387','#a4262c'];
const PIE_GREEN  = ['#107c10','#2b7a2b','#3c8f3c','#4eab4e','#60c760','#72e272','#84f884'];
const DAY_NAMES  = ['일','월','화','수','목','금','토'];

function BarTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--ms-border-2)',
      borderRadius: 2, padding: '10px 14px', fontSize: 13,
      boxShadow: 'var(--ms-shadow-8)',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--ms-text-1)', marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: p.fill }} />
          <span style={{ color: 'var(--ms-text-2)' }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: p.fill, fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0].payload;
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--ms-border-2)',
      borderRadius: 2, padding: '8px 12px', fontSize: 12,
      boxShadow: 'var(--ms-shadow-8)',
    }}>
      <p style={{ fontWeight: 700, color: 'var(--ms-text-1)' }}>{CAT_ICONS[name] ?? '📝'} {name}</p>
      <p style={{ color: 'var(--ms-text-2)', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(value)}</p>
      <p style={{ color: 'var(--ms-blue)', fontWeight: 600 }}>{(percent * 100).toFixed(1)}%</p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ms-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '8px 14px',
        background: 'var(--ms-surface-2)',
        borderBottom: '1px solid var(--ms-border)',
        fontSize: 13, fontWeight: 600, color: 'var(--ms-text-1)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function DashboardTab() {
  const { transactions } = useTransactions();
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const today = toLocalISO(now);

  const monthTxs = useMemo(
    () => transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [transactions, year, month]
  );

  const weekDates = useMemo(() => getWeekDates(0), []);
  const weekTxs   = useMemo(
    () => transactions.filter(t => t.date >= weekDates[0] && t.date <= weekDates[6]),
    [transactions, weekDates]
  );

  const monthIncome  = sumBy(monthTxs, 'income');
  const monthExpense = sumBy(monthTxs, 'expense');
  const monthBalance = monthIncome - monthExpense;
  const weekIncome   = sumBy(weekTxs,  'income');
  const weekExpense  = sumBy(weekTxs,  'expense');
  const savingRate   = monthIncome > 0
    ? Math.max(0, (monthBalance / monthIncome) * 100)
    : 0;

  const weekBarData = useMemo(() =>
    weekDates.map(dateStr => {
      const txs = transactions.filter(t => t.date === dateStr);
      const d   = new Date(dateStr + 'T00:00:00');
      return {
        name: `${DAY_NAMES[d.getDay()]}(${d.getDate()})`,
        수입: sumBy(txs, 'income'),
        지출: sumBy(txs, 'expense'),
        isToday: dateStr === today,
      };
    }),
    [transactions, weekDates, today]
  );

  const monthBarData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const weeks: { label: string; start: Date; end: Date }[] = [];
    let cur = new Date(firstDay); let wi = 1;
    while (cur <= lastDay) {
      const wStart = new Date(cur);
      const wEnd   = new Date(cur);
      while (wEnd.getDay() !== 0 && wEnd < lastDay) wEnd.setDate(wEnd.getDate() + 1);
      const safeEnd = wEnd > lastDay ? new Date(lastDay) : new Date(wEnd);
      weeks.push({ label: `${wi}주차`, start: wStart, end: safeEnd });
      cur = new Date(safeEnd); cur.setDate(cur.getDate() + 1); wi++;
      if (cur > lastDay) break;
    }
    return weeks.map(w => {
      const txs = monthTxs.filter(t => {
        const td = new Date(t.date + 'T00:00:00');
        return td >= w.start && td <= w.end;
      });
      return { name: w.label, 수입: sumBy(txs, 'income'), 지출: sumBy(txs, 'expense') };
    });
  }, [monthTxs, year, month]);

  const expensePie = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [monthTxs]);

  const incomePie = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'income').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [monthTxs]);

  const yFmt = (v: number) => v >= 10000 ? `${(v / 10000).toFixed(0)}만` : String(v);
  const isEmpty = transactions.length === 0;

  return (
    <div>
      {/* 섹션 타이틀 */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 18, background: 'var(--ms-blue)' }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ms-text-1)' }}>
          {year}년 {month + 1}월 재무 현황
        </span>
      </div>

      {/* ── 월간 KPI 배너 ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        gap: 0, marginBottom: 12, overflow: 'hidden',
        border: '1px solid var(--ms-blue)', borderRadius: 2,
      }}>
        {/* 왼쪽: 잔액 */}
        <div style={{ background: 'var(--ms-blue)', color: '#fff', padding: '18px 20px' }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>이번 달 순잔액</div>
          <div style={{
            fontSize: 28, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.5px',
          }}>
            {monthBalance < 0 ? '-' : '+'}{formatMoney(monthBalance)}
          </div>
          {monthIncome > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                저축률 {savingRate.toFixed(1)}%
              </div>
              <div style={{ background: 'rgba(255,255,255,0.25)', height: 4, borderRadius: 0 }}>
                <div style={{
                  height: '100%', background: '#fff',
                  width: `${Math.min(100, savingRate)}%`,
                  transition: 'width .5s ease',
                }} />
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 수입/지출 */}
        <div style={{
          background: 'var(--ms-surface)', display: 'flex',
          flexDirection: 'column', borderLeft: '1px solid var(--ms-blue)',
        }}>
          <div style={{
            flex: 1, padding: '14px 20px',
            borderBottom: '1px solid var(--ms-border)',
          }}>
            <div style={{ fontSize: 11, color: 'var(--ms-text-3)', marginBottom: 3 }}>월 수입</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ms-green)', fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(monthIncome)}
            </div>
          </div>
          <div style={{ flex: 1, padding: '14px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--ms-text-3)', marginBottom: 3 }}>월 지출</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ms-red)', fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(monthExpense)}
            </div>
          </div>
        </div>
      </div>

      {/* 주간 요약 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[
          { label: '이번 주 수입', value: weekIncome,  color: 'var(--ms-green)', icon: '↑' },
          { label: '이번 주 지출', value: weekExpense, color: 'var(--ms-red)',   icon: '↓' },
        ].map(c => (
          <div key={c.label} className="ms-card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--ms-text-3)', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontVariantNumeric: 'tabular-nums' }}>
              {c.icon} {formatMoney(c.value)}
            </div>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="ms-card" style={{ padding: '50px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.2 }}>📊</div>
          <p style={{ color: 'var(--ms-text-3)', fontSize: 13 }}>
            아직 데이터가 없습니다.<br />
            입출력 탭에서 내역을 추가하면 차트가 표시됩니다.
          </p>
        </div>
      ) : (
        <>
          {/* ── 주간 막대차트 ── */}
          <SectionCard title="이번 주 일별 수입·지출">
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={weekBarData} barCategoryGap="30%" barGap={3}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--ms-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#605e5c' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={yFmt} tick={{ fontSize: 11, fill: '#a19f9d' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<BarTip />} cursor={{ fill: 'var(--ms-blue-xlight)' }} />
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                  <Bar dataKey="수입" radius={[0,0,0,0]}>
                    {weekBarData.map((e, i) => (
                      <Cell key={i} fill={e.isToday ? '#107c10' : '#55a77e'} />
                    ))}
                  </Bar>
                  <Bar dataKey="지출" radius={[0,0,0,0]}>
                    {weekBarData.map((e, i) => (
                      <Cell key={i} fill={e.isToday ? '#d13438' : '#e07070'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* ── 월간 주차별 막대차트 ── */}
          <SectionCard title={`${month + 1}월 주차별 수입·지출`}>
            <div style={{ padding: '16px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthBarData} barCategoryGap="35%" barGap={3}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--ms-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#605e5c' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={yFmt} tick={{ fontSize: 11, fill: '#a19f9d' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<BarTip />} cursor={{ fill: 'var(--ms-blue-xlight)' }} />
                  <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
                  <Bar dataKey="수입" fill="#55a77e" radius={[0,0,0,0]} />
                  <Bar dataKey="지출" fill="#e07070" radius={[0,0,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* ── 파이차트 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {/* 지출 파이 */}
            <SectionCard title={`${month + 1}월 지출 분류`}>
              {expensePie.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--ms-text-3)', padding: '24px 0', fontSize: 12 }}>
                  지출 없음
                </p>
              ) : (
                <div style={{ padding: '8px 8px 4px' }}>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={expensePie} cx="50%" cy="50%"
                        innerRadius={45} outerRadius={72}
                        paddingAngle={1} dataKey="value" stroke="none">
                        {expensePie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <PieTooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ fontSize: 11, color: 'var(--ms-text-2)', textAlign: 'center', marginBottom: 6 }}>
                    총 <span style={{ fontWeight: 700, color: 'var(--ms-red)' }}>{formatMoney(monthExpense)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
                    {expensePie.slice(0, 8).map((d, i) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <span style={{
                          width: 8, height: 8, flexShrink: 0,
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }} />
                        <span style={{ color: 'var(--ms-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* 수입 파이 */}
            <SectionCard title={`${month + 1}월 수입 분류`}>
              {incomePie.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--ms-text-3)', padding: '24px 0', fontSize: 12 }}>
                  수입 없음
                </p>
              ) : (
                <div style={{ padding: '8px 8px 4px' }}>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={incomePie} cx="50%" cy="50%"
                        innerRadius={45} outerRadius={72}
                        paddingAngle={1} dataKey="value" stroke="none">
                        {incomePie.map((_, i) => (
                          <Cell key={i} fill={PIE_GREEN[i % PIE_GREEN.length]} />
                        ))}
                      </Pie>
                      <PieTooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ fontSize: 11, color: 'var(--ms-text-2)', textAlign: 'center', marginBottom: 6 }}>
                    총 <span style={{ fontWeight: 700, color: 'var(--ms-green)' }}>{formatMoney(monthIncome)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
                    {incomePie.slice(0, 8).map((d, i) => (
                      <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <span style={{
                          width: 8, height: 8, flexShrink: 0,
                          background: PIE_GREEN[i % PIE_GREEN.length],
                        }} />
                        <span style={{ color: 'var(--ms-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
