'use client';

import { CAT_ICONS, formatMoney } from '@/lib/budget';

interface CategoryChartProps {
  data: Record<string, number>;
  total: number;
}

const BAR_COLORS = [
  '#0078d4','#106ebe','#2b88d8','#71afe5',
  '#107c10','#ca5010','#8764b8','#038387',
];

export default function CategoryChart({ data, total }: CategoryChartProps) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return (
      <p style={{ color: 'var(--ms-text-3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
        지출 내역이 없습니다
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map(([cat, amt], i) => {
        const pct = total > 0 ? (amt / total) * 100 : 0;
        return (
          <div key={cat}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--ms-text-1)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>{CAT_ICONS[cat] ?? '📝'}</span>
                <span>{cat}</span>
              </span>
              <span style={{ fontSize: 12, color: 'var(--ms-text-2)', fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(amt)}
                <span style={{ marginLeft: 6, color: 'var(--ms-text-3)' }}>
                  {pct.toFixed(1)}%
                </span>
              </span>
            </div>
            {/* MS 스타일 프로그레스 바 */}
            <div style={{
              height: 4, background: 'var(--ms-border)',
              borderRadius: 0, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: BAR_COLORS[i % BAR_COLORS.length],
                transition: 'width .4s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
