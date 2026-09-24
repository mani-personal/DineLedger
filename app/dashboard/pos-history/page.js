'use client';
import { useEffect, useState } from 'react';
import BillsTable from '@/components/BillsTable';
import Receipt, { printReceipt } from '@/components/Receipt';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function PosHistoryPage() {
  const [sales, setSales] = useState([]);
  const [me, setMe] = useState(null);
  const [printBill, setPrintBill] = useState(null);

  useEffect(() => {
    fetch('/api/bills')
      .then((r) => r.json())
      .then((d) => setSales((d.bills || []).filter((b) => b.category === 'POS Sale')));
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.session?.restaurant));
  }, []);

  const total = sales.reduce((s, b) => s + Number(b.amount), 0);

  function handlePrint(b) {
    setPrintBill(b);
    setTimeout(printReceipt, 100);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs uppercase text-gray-500 font-semibold">Total POS Sales</div>
          <div className="text-2xl font-bold text-green-600">{inr(total)}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs uppercase text-gray-500 font-semibold">Number of Sales</div>
          <div className="text-2xl font-bold">{sales.length}</div>
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">POS Sale History</h2>
        <BillsTable bills={sales} onPrint={handlePrint} />
      </div>
      <Receipt restaurantName={me?.name} bill={printBill} />
    </div>
  );
}
