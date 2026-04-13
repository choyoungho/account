'use client';

import { Transaction, toLocalISO } from '@/lib/budget';

interface MonthCalendarProps {
  year: number;
  month: number;
  transactions: Transaction[];
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export default function MonthCalendar({ year, month, transactions }: MonthCalendarProps) {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = toLocalISO(new Date());

  const dayExp: Record<number, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const d = parseInt(t.date.split('-')[2]);
      dayExp[d] = (dayExp[d] ?? 0) + t.amount;
    });

  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--ms-border-2)' }}>
          {DAY_LABELS.map((d, i) => (
            <th key={d} style={{
              padding: '6px 4px', textAlign: 'center',
              fontSize: 12, fontWeight: 600,
              color: i === 5 ? '#0078d4' : i === 6 ? '#d13438' : 'var(--ms-text-2)',
              background: 'var(--ms-surface-2)',
            }}>
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((day, di) => {
              if (!day) return <td key={di} style={{ padding: 4 }} />;
              const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = iso === today;
              const exp = dayExp[day];
              const color = di === 5 ? '#0078d4' : di === 6 ? '#d13438' : 'var(--ms-text-1)';

              return (
                <td key={di} style={{
                  padding: 4, textAlign: 'center', verticalAlign: 'top',
                  background: isToday ? 'var(--ms-blue-xlight)' : undefined,
                  borderLeft: isToday ? '2px solid var(--ms-blue)' : undefined,
                }}>
                  <div style={{ fontWeight: isToday ? 700 : 400, color, fontSize: 13 }}>
                    {day}
                  </div>
                  {exp ? (
                    <div style={{ fontSize: 10, color: 'var(--ms-red)', marginTop: 1 }}>
                      -{(exp / 10000).toFixed(1)}만
                    </div>
                  ) : null}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
