'use client';
import { useEffect, useState } from 'react';
import BillsTable from '@/components/BillsTable';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function DashboardPage() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    fetch('/api/bills')
      .then((r) => r.json())
      .then((d) => setBills(d.bills || []));
  }, []);

  const rev = bills.filter((b) => b.type === 'revenue').reduce((s, b) => s + Number(b.amount), 0);
  const exp = bills.filter((b) => b.type === 'expense').reduce((s, b) => s + Number(b.amount), 0);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card label="Revenue" value={inr(rev)} color="text-green-600" />
        <Card label="Expenses" value={inr(exp)} color="text-red-600" />
        <Card label="Net Profit" value={inr(rev - exp)} />
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Recent Activity</h2>
        <BillsTable bills={bills.slice(0, 8)} />
      </div>
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="text-xs uppercase text-gray-500 font-semibold">{label}</div>
      <div className={`text-2xl font-bold ${color || ''}`}>{value}</div>
    </div>
  );
}
