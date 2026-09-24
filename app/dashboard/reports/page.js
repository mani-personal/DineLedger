'use client';
import { useEffect, useState } from 'react';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

function periodKey(dateStr, period) {
  if (period === 'daily') return dateStr;
  if (period === 'yearly') return dateStr.slice(0, 4);
  if (period === 'monthly') return dateStr.slice(0, 7);
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return 'Week of ' + monday.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const [bills, setBills] = useState([]);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    fetch('/api/bills')
      .then((r) => r.json())
      .then((d) => setBills(d.bills || []));
  }, []);

  const buckets = {};
  bills.forEach((b) => {
    const k = periodKey(b.date, period);
    buckets[k] = buckets[k] || { rev: 0, exp: 0 };
    buckets[k][b.type === 'revenue' ? 'rev' : 'exp'] += Number(b.amount);
  });
  const rows = Object.keys(buckets).sort().reverse();

  const expCats = {};
  bills
    .filter((b) => b.type === 'expense')
    .forEach((b) => {
      expCats[b.category] = (expCats[b.category] || 0) + Number(b.amount);
    });
  const expTotal = Object.values(expCats).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <div className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold mb-3">Revenue Summary</h2>
        <div className="flex gap-2 flex-wrap mb-4">
          {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                period === p ? 'bg-indigo-600 text-white border-indigo-600' : ''
              }`}
            >
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase">
                <th className="py-2">Period</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((k) => (
                  <tr key={k} className="border-t">
                    <td className="py-2">{k}</td>
                    <td className="text-green-600">{inr(buckets[k].rev)}</td>
                    <td className="text-red-600">{inr(buckets[k].exp)}</td>
                    <td>{inr(buckets[k].rev - buckets[k].exp)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-gray-400 py-3">
                    No data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Expense Breakdown by Category</h2>
        {!Object.keys(expCats).length ? (
          <div className="text-gray-400 text-sm">No expenses recorded.</div>
        ) : (
          Object.entries(expCats).map(([c, v]) => (
            <div key={c} className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>{c}</span>
                <span>{inr(v)}</span>
              </div>
              <div className="bg-gray-100 rounded h-2 overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: `${(v / expTotal) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
