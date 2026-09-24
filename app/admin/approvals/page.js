'use client';
import { useEffect, useState } from 'react';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function ApprovalsPage() {
  const [payments, setPayments] = useState([]);

  function load() {
    fetch('/api/admin/payments')
      .then((r) => r.json())
      .then((d) => setPayments((d.payments || []).filter((p) => p.status === 'pending')));
  }
  useEffect(load, []);

  async function act(id, status) {
    await fetch(`/api/admin/payments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    load();
  }

  return (
    <div className="bg-white border rounded-2xl p-5">
      <h2 className="font-semibold mb-3">
        Pending Payment Approvals{' '}
        {payments.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            {payments.length}
          </span>
        )}
      </h2>
      {!payments.length ? (
        <div className="text-gray-400 text-sm">No pending approvals 🎉</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase">
                <th className="py-2">Restaurant</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Screenshot</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 font-semibold">{p.restaurant_name}</td>
                  <td>{p.plan}</td>
                  <td>{inr(p.amount)}</td>
                  <td>{p.date}</td>
                  <td>
                    {p.screenshot_url ? (
                      <img src={p.screenshot_url} alt="" className="w-16 rounded-lg border" />
                    ) : (
                      <span className="text-gray-400">no image</span>
                    )}
                  </td>
                  <td className="flex gap-2 py-2">
                    <button onClick={() => act(p.id, 'approved')} className="text-xs bg-indigo-600 text-white rounded-lg px-2 py-1">
                      Approve
                    </button>
                    <button onClick={() => act(p.id, 'rejected')} className="text-xs bg-red-600 text-white rounded-lg px-2 py-1">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
