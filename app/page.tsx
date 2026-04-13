'use client';

import { useState, useEffect } from 'react';
import { formatHeaderDate } from '@/lib/budget';
import DailyTab from './components/DailyTab';
import WeeklyTab from './components/WeeklyTab';
import MonthlyTab from './components/MonthlyTab';
import DashboardTab from './components/DashboardTab';

type Tab = 'dashboard' | 'daily' | 'weekly' | 'monthly';

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: '🏠 대시보드' },
  { id: 'daily',     label: '📅 입출력' },
  { id: 'weekly',    label: '📊 주간' },
  { id: 'monthly',   label: '📆 월말' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(formatHeaderDate(new Date()));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
      {/* 헤더 */}
      <header
        className="text-white px-6 py-5 shadow-md"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <h1 className="text-2xl font-bold tracking-tight">💰 가계부</h1>
        <p className="text-sm opacity-80 mt-0.5">{dateStr}</p>
      </header>

      {/* 네비게이션 */}
      <nav className="flex bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 text-sm font-medium transition-all border-b-[3px] -mb-0.5 ${
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600 font-bold'
                : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 탭 컨텐츠 */}
      <main className="max-w-2xl mx-auto px-4 py-5">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'daily'     && <DailyTab />}
        {activeTab === 'weekly'    && <WeeklyTab />}
        {activeTab === 'monthly'   && <MonthlyTab />}
      </main>
    </div>
  );
}
