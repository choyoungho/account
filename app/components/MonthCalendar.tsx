'use client';

import { Transaction, toLocalISO } from '@/lib/budget';

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  transactions: Transaction[];
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export default function MonthCalendar({ year, month, transactions }: MonthCalendarProps) {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = toLocalISO(new Date());

  // 날짜별 지출 집계
  const dayExp: Record<number, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const d = parseInt(t.date.split('-')[2]);
      dayExp[d] = (dayExp[d] ?? 0) + t.amount;
    });

  // 월요일 기준 시작 오프셋 (0=월, 6=일)
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];

  // 7의 배수로 패딩
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {DAY_LABELS.map((d, i) => (
            <th
              key={d}
              className="py-1.5 text-center text-xs font-bold"
              style={{ color: i === 5 ? '#4299e1' : i === 6 ? '#e53e3e' : '#718096' }}
            >
              {d}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((day, di) => {
              if (!day) return <td key={di} />;
              const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = iso === today;
              const exp = dayExp[day];
              const color = di === 5 ? '#4299e1' : di === 6 ? '#e53e3e' : '#2d3748';

              return (
                <td
                  key={di}
                  className="px-0.5 py-1 text-center align-top rounded"
                  style={{ background: isToday ? '#ede9fe' : undefined }}
                >
                  <div className="font-medium text-xs" style={{ color, fontWeight: isToday ? 700 : 500 }}>
                    {day}
                  </div>
                  {exp ? (
                    <div className="text-red-500 mt-0.5" style={{ fontSize: '0.65rem' }}>
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
