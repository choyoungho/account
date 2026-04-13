'use client';

import { useState, useEffect } from 'react';
import { formatHeaderDate } from '@/lib/budget';
import DailyTab from './components/DailyTab';
import WeeklyTab from './components/WeeklyTab';
import MonthlyTab from './components/MonthlyTab';
import DashboardTab from './components/DashboardTab';

type Tab = 'dashboard' | 'daily' | 'weekly' | 'monthly';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: '대시보드',   icon: '⊞' },
  { id: 'daily',     label: '입출력',     icon: '✎' },
  { id: 'weekly',    label: '주간 정산',  icon: '⊟' },
  { id: 'monthly',   label: '월말 정산',  icon: '▦' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(formatHeaderDate(new Date()));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--ms-bg)' }}>

      {/* ── Command Bar (상단 헤더) ── */}
      <header style={{ background: 'var(--ms-blue)', color: '#fff' }}>
        {/* 앱 타이틀 바 */}
        <div className="flex items-center gap-3 px-5 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-2">
            {/* MS 윈도우 그리드 아이콘 */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="8" height="8" fill="white" opacity="0.9"/>
              <rect x="11" y="1" width="8" height="8" fill="white" opacity="0.9"/>
              <rect x="1" y="11" width="8" height="8" fill="white" opacity="0.9"/>
              <rect x="11" y="11" width="8" height="8" fill="white" opacity="0.9"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>
              가계부
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />
          <span style={{ fontSize: 13, opacity: 0.9, fontWeight: 500 }}>{dateStr}</span>
        </div>

        {/* Pivot 네비게이션 */}
        <nav className="flex px-2" style={{ background: 'var(--ms-blue)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.75)',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id
                  ? '2px solid #fff'
                  : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color .1s, border-color .1s',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id)
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id)
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
              }}
            >
              <span style={{ fontSize: 15 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── 콘텐츠 영역 ── */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'daily'     && <DailyTab />}
        {activeTab === 'weekly'    && <WeeklyTab />}
        {activeTab === 'monthly'   && <MonthlyTab />}
      </main>
    </div>
  );
}
