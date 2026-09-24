'use client';
import { useEffect, useState } from 'react';
import BillsTable from '@/components/BillsTable';
import Receipt, { printReceipt } from '@/components/Receipt';

const REV_CATS = ['Dine-in', 'Takeaway', 'Delivery', 'Other'];
const EXP_CATS = ['Inventory', 'Staff', 'Utilities', 'Rent', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [me, setMe] = useState(null);
  const [type, setType] = useState('revenue');
  const [printBill, setPrintBill] = useState(null);

  function load() {
    fetch('/api/bills')
      .then((r) => r.json())
      .then((d) => setBills(d.bills || []));
  }

  useEffect(() => {
    load();
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.session?.restaurant));
  }, []);

  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: f.get('type'),
        category: f.get('category'),
        amount: Number(f.get('amount')),
        note: f.get('note'),
        date: f.get('date')
      })
    });
    e.target.reset();
    load();
  }

  function handlePrint(b) {
    setPrintBill(b);
    setTimeout(printReceipt, 100);
  }

  return (
    <div>
      <div className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold mb-3">Add Entry</h2>
        <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
          <Field label="Type">
            <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg px-3 py-2">
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </Field>
          <Field label="Category">
            <select name="category" className="border rounded-lg px-3 py-2">
              {(type === 'revenue' ? REV_CATS : EXP_CATS).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Amount (₹)">
            <input name="amount" type="number" min="1" required className="border rounded-lg px-3 py-2 w-28" />
          </Field>
          <Field label="Note">
            <input name="note" required placeholder="e.g. Dinner service" className="border rounded-lg px-3 py-2" />
          </Field>
          <Field label="Date">
            <input name="date" type="date" defaultValue={today()} required className="border rounded-lg px-3 py-2" />
          </Field>
          <button className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-semibold">Add Entry</button>
        </form>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">All Bills & Expenses</h2>
        <BillsTable bills={bills} onPrint={handlePrint} />
      </div>

      <Receipt restaurantName={me?.name} bill={printBill} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
