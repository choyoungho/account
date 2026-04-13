'use client';

import { CAT_ICONS, formatMoney } from '@/lib/budget';

interface CategoryChartProps {
  data: Record<string, number>;
  total: number;
}

export default function CategoryChart({ data, total }: CategoryChartProps) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return (
      <p className="text-center text-gray-300 text-sm py-4">
        지출 내역이 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {sorted.map(([cat, amt]) => {
        const pct = total > 0 ? (amt / total) * 100 : 0;
        return (
          <div key={cat}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-gray-600">
                {CAT_ICONS[cat] ?? '📝'} {cat}
              </span>
              <span className="text-gray-500">
                {formatMoney(amt)} ({pct.toFixed(1)}%)
              </span>
            </div>
            <div className="bg-gray-100 rounded h-1.5 overflow-hidden">
              <div
                className="h-full rounded"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
