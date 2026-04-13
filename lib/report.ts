import { Transaction, TxType, CAT_ICONS } from './budget';

// ─── 유틸 ─────────────────────────────────────────────
function money(n: number): string {
  return '₩' + Math.abs(n).toLocaleString('ko-KR');
}
function sumBy(txs: Transaction[], type: TxType): number {
  return txs.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
}
function pct(part: number, total: number): string {
  if (total === 0) return '0.0%';
  return ((part / total) * 100).toFixed(1) + '%';
}
function savingRate(income: number, expense: number): string {
  if (income === 0) return '0.0%';
  const r = Math.max(0, ((income - expense) / income) * 100);
  return r.toFixed(1) + '%';
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${DAY_KO[d.getDay()]})`;
}

// ─── 공통 HTML 래퍼 ───────────────────────────────────
function wrapReport(title: string, period: string, body: string): string {
  const generated = new Date().toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — ${period}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Malgun Gothic', 'Noto Sans KR', 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #111;
    background: #f0ede8;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .page {
    max-width: 820px;
    margin: 24px auto;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0,0,0,.15);
  }

  /* ── 헤더 ── */
  .rpt-header {
    background: #0078d4;
    color: #fff;
    padding: 0;
  }
  .rpt-header-top {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 28px 14px;
    border-bottom: 1px solid rgba(255,255,255,.2);
  }
  .rpt-logo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3px;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }
  .rpt-logo span {
    display: block;
    background: rgba(255,255,255,.9);
  }
  .rpt-title {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.4px;
  }
  .rpt-subtitle {
    font-size: 13px;
    opacity: .8;
    margin-top: 2px;
  }
  .rpt-header-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 28px;
    font-size: 12px;
    opacity: .85;
  }
  .rpt-period {
    font-size: 14px;
    font-weight: 600;
    opacity: 1;
  }

  /* ── 요약 KPI ── */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-bottom: 2px solid #0078d4;
  }
  .kpi-cell {
    padding: 18px 20px;
    border-right: 1px solid #e8e6e3;
  }
  .kpi-cell:last-child { border-right: none; }
  .kpi-label {
    font-size: 11px;
    font-weight: 700;
    color: #6e6b69;
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-bottom: 6px;
  }
  .kpi-value {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
    font-variant-numeric: tabular-nums;
  }
  .kpi-income  { color: #107c10; }
  .kpi-expense { color: #c50f1f; }
  .kpi-balance-pos { color: #0078d4; }
  .kpi-balance-neg { color: #c50f1f; }
  .kpi-saving  { color: #744da9; }
  .kpi-sub {
    font-size: 11px;
    color: #6e6b69;
    margin-top: 4px;
  }

  /* ── 섹션 ── */
  .section {
    padding: 0;
    border-bottom: 1px solid #e8e6e3;
  }
  .section:last-child { border-bottom: none; }
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 28px 10px;
    background: #f5f3f0;
    border-bottom: 1px solid #d2cfc9;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #111;
  }
  .section-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #0078d4;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .section-count {
    font-size: 12px;
    color: #6e6b69;
  }
  .section-body { padding: 0; }

  /* ── 상세 테이블 ── */
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  thead th {
    padding: 9px 14px;
    text-align: left;
    background: #faf9f8;
    color: #3b3938;
    font-size: 12px;
    font-weight: 700;
    border-bottom: 1.5px solid #b3afa8;
    white-space: nowrap;
  }
  tbody td {
    padding: 9px 14px;
    border-bottom: 1px solid #ede9e4;
    color: #111;
    vertical-align: middle;
  }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:nth-child(even) td { background: #faf9f8; }
  tfoot td {
    padding: 10px 14px;
    font-weight: 700;
    background: #f0ede8;
    border-top: 2px solid #b3afa8;
    font-size: 13px;
  }

  /* ── 날짜 그룹 헤더 ── */
  .date-group-row td {
    padding: 7px 14px;
    background: #eff6fc;
    border-bottom: 1px solid #deecf9;
    font-weight: 700;
    font-size: 12px;
    color: #0078d4;
  }

  /* ── 카테고리 바 ── */
  .cat-row {
    padding: 8px 28px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #ede9e4;
  }
  .cat-row:last-child { border-bottom: none; }
  .cat-icon { font-size: 16px; width: 24px; text-align: center; flex-shrink: 0; }
  .cat-name { width: 100px; font-size: 13px; color: #111; font-weight: 500; flex-shrink: 0; }
  .cat-bar-wrap {
    flex: 1;
    height: 10px;
    background: #e8e6e3;
    border-radius: 0;
    overflow: hidden;
  }
  .cat-bar { height: 100%; border-radius: 0; }
  .cat-amt { width: 100px; text-align: right; font-size: 13px; font-weight: 700; color: #c50f1f; font-variant-numeric: tabular-nums; flex-shrink: 0; }
  .cat-pct { width: 48px; text-align: right; font-size: 12px; color: #6e6b69; flex-shrink: 0; }

  /* ── 주간 테이블 ── */
  .day-highlight { background: #eff6fc !important; }
  .day-highlight td { color: #0078d4 !important; }

  /* ── 푸터 ── */
  .rpt-footer {
    background: #f5f3f0;
    border-top: 2px solid #0078d4;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: #6e6b69;
  }
  .rpt-footer strong { color: #111; }

  /* ── 인쇄 ── */
  @media print {
    body { background: #fff; }
    .page { box-shadow: none; margin: 0; max-width: 100%; }
    .no-print { display: none !important; }
  }

  /* ── 인쇄 버튼 ── */
  .print-bar {
    background: #0078d4;
    padding: 8px 28px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  .print-btn {
    padding: 5px 16px;
    background: rgba(255,255,255,.15);
    color: #fff;
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 2px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .print-btn:hover { background: rgba(255,255,255,.25); }
</style>
</head>
<body>
<div class="page">

  <!-- 헤더 -->
  <div class="rpt-header">
    <div class="print-bar no-print">
      <button class="print-btn" onclick="window.print()">🖨 인쇄 / PDF 저장</button>
    </div>
    <div class="rpt-header-top">
      <div class="rpt-logo">
        <span></span><span></span><span></span><span></span>
      </div>
      <div>
        <div class="rpt-title">가계부 재무 보고서</div>
        <div class="rpt-subtitle">Personal Finance Report</div>
      </div>
    </div>
    <div class="rpt-header-meta">
      <span class="rpt-period">${period}</span>
      <span>생성일시: ${generated}</span>
    </div>
  </div>

  ${body}

  <!-- 푸터 -->
  <div class="rpt-footer">
    <span><strong>가계부</strong> — Microsoft Fluent Design</span>
    <span>본 보고서는 자동 생성되었습니다 · ${generated}</span>
  </div>
</div>
</body>
</html>`;
}

// ─── 카테고리 분석 섹션 ──────────────────────────────
const CAT_BAR_COLORS = [
  '#0078d4','#106ebe','#2b88d8','#71afe5',
  '#107c10','#ca5010','#8764b8','#038387',
  '#d13438','#ffb900','#00b7c3',
];

function categorySection(txs: Transaction[], sectionNum: string): string {
  const expTxs = txs.filter(t => t.type === 'expense');
  const total = expTxs.reduce((s, t) => s + t.amount, 0);
  const map: Record<string, number> = {};
  expTxs.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return `<div class="section">
      <div class="section-header">
        <div class="section-title"><span class="section-num">${sectionNum}</span> 카테고리별 지출 분석</div>
      </div>
      <div style="padding:24px;text-align:center;color:#6e6b69;font-size:13px;">지출 내역이 없습니다</div>
    </div>`;
  }

  const rows = sorted.map(([cat, amt], i) => {
    const p = total > 0 ? ((amt / total) * 100).toFixed(1) : '0.0';
    const barW = total > 0 ? (amt / total) * 100 : 0;
    const color = CAT_BAR_COLORS[i % CAT_BAR_COLORS.length];
    const icon = CAT_ICONS[cat] ?? '📝';
    return `<div class="cat-row">
      <span class="cat-icon">${icon}</span>
      <span class="cat-name">${cat}</span>
      <div class="cat-bar-wrap"><div class="cat-bar" style="width:${barW.toFixed(1)}%;background:${color};"></div></div>
      <span class="cat-amt">-${money(amt)}</span>
      <span class="cat-pct">${p}%</span>
    </div>`;
  }).join('');

  const totalRow = `<div class="cat-row" style="background:#f5f3f0;border-top:2px solid #b3afa8;">
    <span class="cat-icon"></span>
    <span class="cat-name" style="font-weight:700;">합계</span>
    <div class="cat-bar-wrap"></div>
    <span class="cat-amt" style="font-size:14px;">-${money(total)}</span>
    <span class="cat-pct" style="font-weight:700;">100%</span>
  </div>`;

  return `<div class="section">
    <div class="section-header">
      <div class="section-title"><span class="section-num">${sectionNum}</span> 카테고리별 지출 분석</div>
      <span class="section-count">${sorted.length}개 카테고리</span>
    </div>
    <div class="section-body" style="padding:8px 0;">
      ${rows}${totalRow}
    </div>
  </div>`;
}

// ─── 일간 리포트 ─────────────────────────────────────
export function generateDailyReport(date: string, txs: Transaction[]): string {
  const dayTxs = txs.filter(t => t.date === date);
  const income  = sumBy(dayTxs, 'income');
  const expense = sumBy(dayTxs, 'expense');
  const balance = income - expense;
  const period  = fmtDate(date) + ' 일간 보고서';

  const kpi = `<div class="kpi-grid">
    <div class="kpi-cell">
      <div class="kpi-label">수입 합계</div>
      <div class="kpi-value kpi-income">+${money(income)}</div>
      <div class="kpi-sub">${dayTxs.filter(t=>t.type==='income').length}건</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">지출 합계</div>
      <div class="kpi-value kpi-expense">-${money(expense)}</div>
      <div class="kpi-sub">${dayTxs.filter(t=>t.type==='expense').length}건</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">순 잔액</div>
      <div class="kpi-value ${balance >= 0 ? 'kpi-balance-pos' : 'kpi-balance-neg'}">${balance >= 0 ? '+' : '-'}${money(balance)}</div>
      <div class="kpi-sub">수입 - 지출</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">저축률</div>
      <div class="kpi-value kpi-saving">${savingRate(income, expense)}</div>
      <div class="kpi-sub">순잔액 / 수입</div>
    </div>
  </div>`;

  // 상세 내역
  const txRows = dayTxs.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:24px;color:#6e6b69;">내역 없음</td></tr>`
    : [...dayTxs]
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(t => `<tr>
          <td>${t.time}</td>
          <td><span style="padding:2px 7px;border-radius:2px;font-size:11px;font-weight:700;background:${t.type==='income'?'#dff6dd':'#fde7e9'};color:${t.type==='income'?'#107c10':'#c50f1f'};">${t.type==='income'?'수입':'지출'}</span></td>
          <td>${CAT_ICONS[t.category]??''} ${t.category}</td>
          <td>${t.desc}</td>
          <td style="text-align:right;font-weight:700;font-variant-numeric:tabular-nums;color:${t.type==='income'?'#107c10':'#c50f1f'};">${t.type==='income'?'+':'-'}${money(t.amount)}</td>
        </tr>`).join('');

  const detailSection = `<div class="section">
    <div class="section-header">
      <div class="section-title"><span class="section-num">I</span> 당일 거래 상세</div>
      <span class="section-count">총 ${dayTxs.length}건</span>
    </div>
    <div class="section-body">
      <table>
        <thead><tr><th>시간</th><th>구분</th><th>카테고리</th><th>내용</th><th style="text-align:right;">금액</th></tr></thead>
        <tbody>${txRows}</tbody>
        <tfoot><tr>
          <td colspan="4" style="font-weight:700;">합계</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">
            <span style="color:#107c10;">+${money(income)}</span> /
            <span style="color:#c50f1f;"> -${money(expense)}</span>
          </td>
        </tr></tfoot>
      </table>
    </div>
  </div>`;

  const body = kpi + detailSection + categorySection(dayTxs, 'II');
  return wrapReport('일간 재무 보고서', period, body);
}

// ─── 주간 리포트 ─────────────────────────────────────
export function generateWeeklyReport(
  weekDates: string[],
  txs: Transaction[],
  weekLabel: string,
): string {
  const weekTxs = txs.filter(t => t.date >= weekDates[0] && t.date <= weekDates[6]);
  const income  = sumBy(weekTxs, 'income');
  const expense = sumBy(weekTxs, 'expense');
  const balance = income - expense;
  const period  = weekLabel + ' 주간 보고서';

  const kpi = `<div class="kpi-grid">
    <div class="kpi-cell">
      <div class="kpi-label">주간 수입</div>
      <div class="kpi-value kpi-income">+${money(income)}</div>
      <div class="kpi-sub">${weekTxs.filter(t=>t.type==='income').length}건</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">주간 지출</div>
      <div class="kpi-value kpi-expense">-${money(expense)}</div>
      <div class="kpi-sub">${weekTxs.filter(t=>t.type==='expense').length}건</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">순 잔액</div>
      <div class="kpi-value ${balance>=0?'kpi-balance-pos':'kpi-balance-neg'}">${balance>=0?'+':'-'}${money(balance)}</div>
      <div class="kpi-sub">수입 - 지출</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">저축률</div>
      <div class="kpi-value kpi-saving">${savingRate(income, expense)}</div>
      <div class="kpi-sub">순잔액 / 수입</div>
    </div>
  </div>`;

  // 일별 요약
  const today = new Date().toISOString().split('T')[0];
  const DAY_NAMES = ['일','월','화','수','목','금','토'];
  const dayRows = weekDates.map(dateStr => {
    const dTxs = txs.filter(t => t.date === dateStr);
    const inc = sumBy(dTxs, 'income');
    const exp = sumBy(dTxs, 'expense');
    const bal = inc - exp;
    const d = new Date(dateStr + 'T00:00:00');
    const isToday = dateStr === today;
    const dow = d.getDay();
    const dayColor = dow === 6 ? '#d13438' : dow === 0 ? '#0078d4' : '#111';
    return `<tr class="${isToday?'day-highlight':''}">
      <td style="color:${dayColor};font-weight:${isToday?'700':'400'};">
        ${isToday?'<span style="background:#0078d4;color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:2px;margin-right:5px;">TODAY</span>':''}
        ${d.getMonth()+1}/${d.getDate()} (${DAY_NAMES[dow]})
      </td>
      <td style="text-align:right;font-weight:${inc?'700':'400'};color:${inc?'#107c10':'#a0a0a0'};font-variant-numeric:tabular-nums;">${inc?money(inc):'-'}</td>
      <td style="text-align:right;font-weight:${exp?'700':'400'};color:${exp?'#c50f1f':'#a0a0a0'};font-variant-numeric:tabular-nums;">${exp?money(exp):'-'}</td>
      <td style="text-align:right;font-weight:700;color:${bal>=0?'#0078d4':'#c50f1f'};font-variant-numeric:tabular-nums;">${bal!==0?(bal>0?'+':'-')+money(bal):'-'}</td>
    </tr>`;
  }).join('');

  const dailySummary = `<div class="section">
    <div class="section-header">
      <div class="section-title"><span class="section-num">I</span> 일별 수입·지출 요약</div>
    </div>
    <div class="section-body">
      <table>
        <thead><tr><th>날짜</th><th style="text-align:right;">수입</th><th style="text-align:right;">지출</th><th style="text-align:right;">잔액</th></tr></thead>
        <tbody>${dayRows}</tbody>
        <tfoot><tr>
          <td>주간 합계</td>
          <td style="text-align:right;color:#107c10;font-variant-numeric:tabular-nums;">${money(income)}</td>
          <td style="text-align:right;color:#c50f1f;font-variant-numeric:tabular-nums;">${money(expense)}</td>
          <td style="text-align:right;color:${balance>=0?'#0078d4':'#c50f1f'};font-variant-numeric:tabular-nums;">${balance>=0?'+':'-'}${money(balance)}</td>
        </tr></tfoot>
      </table>
    </div>
  </div>`;

  // 상세 내역
  const txRows = weekTxs.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:24px;color:#6e6b69;">내역 없음</td></tr>`
    : (() => {
        const grouped = new Map<string, Transaction[]>();
        [...weekTxs].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
          .forEach(t => { const arr = grouped.get(t.date)??[]; arr.push(t); grouped.set(t.date, arr); });
        return Array.from(grouped.entries()).map(([date, dTxs]) => {
          const dInc = sumBy(dTxs,'income');
          const dExp = sumBy(dTxs,'expense');
          const header = `<tr class="date-group-row"><td colspan="5">${fmtDate(date)}　　수입 ${money(dInc)} / 지출 ${money(dExp)}</td></tr>`;
          const rows = dTxs.map(t => `<tr>
            <td>${t.time}</td>
            <td><span style="padding:2px 7px;border-radius:2px;font-size:11px;font-weight:700;background:${t.type==='income'?'#dff6dd':'#fde7e9'};color:${t.type==='income'?'#107c10':'#c50f1f'};">${t.type==='income'?'수입':'지출'}</span></td>
            <td>${CAT_ICONS[t.category]??''} ${t.category}</td>
            <td>${t.desc}</td>
            <td style="text-align:right;font-weight:700;font-variant-numeric:tabular-nums;color:${t.type==='income'?'#107c10':'#c50f1f'};">${t.type==='income'?'+':'-'}${money(t.amount)}</td>
          </tr>`).join('');
          return header + rows;
        }).join('');
      })();

  const detailSection = `<div class="section">
    <div class="section-header">
      <div class="section-title"><span class="section-num">II</span> 거래 상세 내역</div>
      <span class="section-count">총 ${weekTxs.length}건</span>
    </div>
    <div class="section-body">
      <table>
        <thead><tr><th>시간</th><th>구분</th><th>카테고리</th><th>내용</th><th style="text-align:right;">금액</th></tr></thead>
        <tbody>${txRows}</tbody>
        <tfoot><tr>
          <td colspan="4">합계</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">
            <span style="color:#107c10;">+${money(income)}</span> /
            <span style="color:#c50f1f;"> -${money(expense)}</span>
          </td>
        </tr></tfoot>
      </table>
    </div>
  </div>`;

  const body = kpi + dailySummary + detailSection + categorySection(weekTxs, 'III');
  return wrapReport('주간 재무 보고서', period, body);
}

// ─── 월간 리포트 ─────────────────────────────────────
export function generateMonthlyReport(
  year: number,
  month: number,
  txs: Transaction[],
): string {
  const monthTxs = txs.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const income  = sumBy(monthTxs, 'income');
  const expense = sumBy(monthTxs, 'expense');
  const balance = income - expense;
  const period  = `${year}년 ${month + 1}월 월간 보고서`;

  const kpi = `<div class="kpi-grid">
    <div class="kpi-cell">
      <div class="kpi-label">월 수입</div>
      <div class="kpi-value kpi-income">+${money(income)}</div>
      <div class="kpi-sub">${monthTxs.filter(t=>t.type==='income').length}건</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">월 지출</div>
      <div class="kpi-value kpi-expense">-${money(expense)}</div>
      <div class="kpi-sub">${monthTxs.filter(t=>t.type==='expense').length}건</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">순 잔액</div>
      <div class="kpi-value ${balance>=0?'kpi-balance-pos':'kpi-balance-neg'}">${balance>=0?'+':'-'}${money(balance)}</div>
      <div class="kpi-sub">수입 - 지출</div>
    </div>
    <div class="kpi-cell">
      <div class="kpi-label">저축률</div>
      <div class="kpi-value kpi-saving">${savingRate(income, expense)}</div>
      <div class="kpi-sub">순잔액 / 수입</div>
    </div>
  </div>`;

  // 주차별 요약
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const weeks: { label: string; start: Date; end: Date }[] = [];
  let cur = new Date(firstDay); let wi = 1;
  while (cur <= lastDay) {
    const wStart = new Date(cur);
    const wEnd = new Date(cur);
    while (wEnd.getDay() !== 0 && wEnd < lastDay) wEnd.setDate(wEnd.getDate() + 1);
    const safeEnd = wEnd > lastDay ? new Date(lastDay) : new Date(wEnd);
    weeks.push({ label: `${wi}주차 (${wStart.getDate()}~${safeEnd.getDate()}일)`, start: wStart, end: safeEnd });
    cur = new Date(safeEnd); cur.setDate(cur.getDate() + 1); wi++;
    if (cur > lastDay) break;
  }

  const weekRows = weeks.map(w => {
    const wTxs = monthTxs.filter(t => {
      const td = new Date(t.date + 'T00:00:00');
      return td >= w.start && td <= w.end;
    });
    const winc = sumBy(wTxs,'income');
    const wexp = sumBy(wTxs,'expense');
    const wbal = winc - wexp;
    return `<tr>
      <td style="font-weight:600;">${w.label}</td>
      <td style="text-align:right;font-weight:${winc?'700':'400'};color:${winc?'#107c10':'#a0a0a0'};font-variant-numeric:tabular-nums;">${winc?money(winc):'-'}</td>
      <td style="text-align:right;font-weight:${wexp?'700':'400'};color:${wexp?'#c50f1f':'#a0a0a0'};font-variant-numeric:tabular-nums;">${wexp?money(wexp):'-'}</td>
      <td style="text-align:right;font-weight:700;color:${wbal>=0?'#0078d4':'#c50f1f'};font-variant-numeric:tabular-nums;">${wbal!==0?(wbal>0?'+':'-')+money(wbal):'-'}</td>
    </tr>`;
  }).join('');

  const weeklySummary = `<div class="section">
    <div class="section-header">
      <div class="section-title"><span class="section-num">I</span> 주차별 수입·지출 요약</div>
    </div>
    <div class="section-body">
      <table>
        <thead><tr><th>주차</th><th style="text-align:right;">수입</th><th style="text-align:right;">지출</th><th style="text-align:right;">잔액</th></tr></thead>
        <tbody>${weekRows}</tbody>
        <tfoot><tr>
          <td>월 합계</td>
          <td style="text-align:right;color:#107c10;font-variant-numeric:tabular-nums;">${money(income)}</td>
          <td style="text-align:right;color:#c50f1f;font-variant-numeric:tabular-nums;">${money(expense)}</td>
          <td style="text-align:right;color:${balance>=0?'#0078d4':'#c50f1f'};font-variant-numeric:tabular-nums;">${balance>=0?'+':'-'}${money(balance)}</td>
        </tr></tfoot>
      </table>
    </div>
  </div>`;

  // 상세 내역
  const txRows = monthTxs.length === 0
    ? `<tr><td colspan="5" style="text-align:center;padding:24px;color:#6e6b69;">내역 없음</td></tr>`
    : (() => {
        const grouped = new Map<string, Transaction[]>();
        [...monthTxs].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time))
          .forEach(t => { const arr = grouped.get(t.date)??[]; arr.push(t); grouped.set(t.date, arr); });
        return Array.from(grouped.entries()).map(([date, dTxs]) => {
          const dInc = sumBy(dTxs,'income');
          const dExp = sumBy(dTxs,'expense');
          const header = `<tr class="date-group-row"><td colspan="5">${fmtDate(date)}　　수입 ${dInc?money(dInc):'-'} / 지출 ${dExp?money(dExp):'-'}</td></tr>`;
          const rows = dTxs.map(t => `<tr>
            <td>${t.time}</td>
            <td><span style="padding:2px 7px;border-radius:2px;font-size:11px;font-weight:700;background:${t.type==='income'?'#dff6dd':'#fde7e9'};color:${t.type==='income'?'#107c10':'#c50f1f'};">${t.type==='income'?'수입':'지출'}</span></td>
            <td>${CAT_ICONS[t.category]??''} ${t.category}</td>
            <td>${t.desc}</td>
            <td style="text-align:right;font-weight:700;font-variant-numeric:tabular-nums;color:${t.type==='income'?'#107c10':'#c50f1f'};">${t.type==='income'?'+':'-'}${money(t.amount)}</td>
          </tr>`).join('');
          return header + rows;
        }).join('');
      })();

  const detailSection = `<div class="section">
    <div class="section-header">
      <div class="section-title"><span class="section-num">II</span> 거래 상세 내역</div>
      <span class="section-count">총 ${monthTxs.length}건</span>
    </div>
    <div class="section-body">
      <table>
        <thead><tr><th>시간</th><th>구분</th><th>카테고리</th><th>내용</th><th style="text-align:right;">금액</th></tr></thead>
        <tbody>${txRows}</tbody>
        <tfoot><tr>
          <td colspan="4">합계</td>
          <td style="text-align:right;font-variant-numeric:tabular-nums;">
            <span style="color:#107c10;">+${money(income)}</span> /
            <span style="color:#c50f1f;"> -${money(expense)}</span>
          </td>
        </tr></tfoot>
      </table>
    </div>
  </div>`;

  // 수입 카테고리
  const incMap: Record<string, number> = {};
  monthTxs.filter(t=>t.type==='income').forEach(t => { incMap[t.category]=(incMap[t.category]??0)+t.amount; });
  const incSorted = Object.entries(incMap).sort((a,b)=>b[1]-a[1]);
  const incSection = incSorted.length === 0
    ? ''
    : `<div class="section">
        <div class="section-header">
          <div class="section-title"><span class="section-num">IV</span> 카테고리별 수입 분석</div>
          <span class="section-count">${incSorted.length}개 카테고리</span>
        </div>
        <div class="section-body" style="padding:8px 0;">
          ${incSorted.map(([cat,amt],i) => {
            const p = income>0?((amt/income)*100).toFixed(1):'0.0';
            const barW = income>0?(amt/income)*100:0;
            return `<div class="cat-row">
              <span class="cat-icon">${CAT_ICONS[cat]??'📝'}</span>
              <span class="cat-name">${cat}</span>
              <div class="cat-bar-wrap"><div class="cat-bar" style="width:${barW.toFixed(1)}%;background:#107c10;opacity:${0.5+0.5*(incSorted.length-i)/incSorted.length};"></div></div>
              <span class="cat-amt" style="color:#107c10;">+${money(amt)}</span>
              <span class="cat-pct">${p}%</span>
            </div>`;
          }).join('')}
          <div class="cat-row" style="background:#f5f3f0;border-top:2px solid #b3afa8;">
            <span class="cat-icon"></span>
            <span class="cat-name" style="font-weight:700;">합계</span>
            <div class="cat-bar-wrap"></div>
            <span class="cat-amt" style="font-size:14px;color:#107c10;">+${money(income)}</span>
            <span class="cat-pct" style="font-weight:700;">100%</span>
          </div>
        </div>
      </div>`;

  const body = kpi + weeklySummary + detailSection + categorySection(monthTxs, 'III') + incSection;
  return wrapReport('월간 재무 보고서', period, body);
}

// ─── 다운로드 트리거 ──────────────────────────────────
export function downloadReport(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
