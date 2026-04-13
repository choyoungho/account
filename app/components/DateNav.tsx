'use client';

interface DateNavProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}

export default function DateNav({ label, onPrev, onNext }: DateNavProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 16, padding: '8px 12px',
      background: 'var(--ms-surface)',
      border: '1px solid var(--ms-border)',
      borderRadius: 2,
    }}>
      <button className="ms-btn" style={{ padding: '4px 12px', fontSize: 13 }} onClick={onPrev}>
        ‹ 이전
      </button>
      <span style={{ fontWeight: 600, color: 'var(--ms-text-1)', fontSize: 14 }}>
        {label}
      </span>
      <button className="ms-btn" style={{ padding: '4px 12px', fontSize: 13 }} onClick={onNext}>
        다음 ›
      </button>
    </div>
  );
}
