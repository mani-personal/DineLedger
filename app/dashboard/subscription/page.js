'use client';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const YEARLY_FINAL = 8000;
const PLATFORM_UPI = process.env.NEXT_PUBLIC_PLATFORM_UPI;

export default function SubscriptionPage() {
  const [me, setMe] = useState(null);
  const [payments, setPayments] = useState([]);
  const [plan, setPlan] = useState('monthly');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  function load() {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.session?.restaurant));
    fetch('/api/payments')
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []));
  }
  useEffect(load, []);

  const amount = plan === 'yearly' ? YEARLY_FINAL : 1000;
  const upiUri = `upi://pay?pa=${encodeURIComponent(PLATFORM_UPI)}&pn=RestroBMS&am=${amount}&cu=INR&tn=Subscription-${plan}`;

  async function submitPayment(e) {
    e.preventDefault();
    const file = e.target.shot.files[0];
    if (!file) return;
    setUploading(true);
    setMsg('');
    const uf = new FormData();
    uf.append('file', file);
    uf.append('folder', 'payments');
    try {
      const upRes = await fetch('/api/upload', { method: 'POST', body: uf });
      const up = await upRes.json();
      if (!upRes.ok) throw new Error(up.error || 'Upload failed');
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, screenshot_url: up.path })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment submission failed');
      setMsg('Submitted! An admin will verify your screenshot and approve the renewal.');
      e.target.reset();
      load();
    } catch (error) {
      setMsg(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold mb-3">Current Subscription</h2>
        {me && (
          <p className="text-sm mb-4">
            Plan: <b>{me.plan}</b> &nbsp; Status:{' '}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                me.sub_status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : me.sub_status === 'pending'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {me.sub_status}
            </span>{' '}
            &nbsp; Valid till: <b>{me.expiry}</b>
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => setPlan('monthly')}
            className={`text-left border-2 rounded-2xl p-4 ${plan === 'monthly' ? 'border-indigo-600 bg-indigo-50' : ''}`}
          >
            <div>Monthly</div>
            <div className="text-2xl font-bold">
              {inr(1000)} <span className="text-sm font-normal text-gray-500">/mo</span>
            </div>
          </button>
          <button
            onClick={() => setPlan('yearly')}
            className={`text-left border-2 rounded-2xl p-4 ${plan === 'yearly' ? 'border-indigo-600 bg-indigo-50' : ''}`}
          >
            <div>
              Yearly <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Save ₹2,000</span>
            </div>
            <div className="text-2xl font-bold">
              <span className="line-through text-gray-400 text-base font-normal mr-2">{inr(10000)}</span>
              {inr(YEARLY_FINAL)}
            </div>
          </button>
        </div>

        <div className="flex flex-wrap gap-6 items-start">
          <div>
            <div className="bg-white p-3 border rounded-xl inline-block">
              {PLATFORM_UPI ? <QRCodeSVG value={upiUri} size={170} /> : <p className="text-red-600 text-sm">Payment UPI is not configured.</p>}
            </div>
            <p className="text-xs text-gray-500 max-w-[180px] mt-2">
              Scan with any UPI app (GPay/PhonePe/Paytm). Amount: {inr(amount)}
            </p>
          </div>
          <form onSubmit={submitPayment} className="flex flex-col gap-2 max-w-xs">
            <label className="text-xs font-semibold text-gray-500">Upload payment screenshot</label>
            <input type="file" name="shot" accept="image/*" required />
            <button disabled={uploading || !PLATFORM_UPI} className="bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60">
              {uploading ? 'Uploading…' : 'Submit Payment for Approval'}
            </button>
            {msg && <p className="text-xs text-green-700">{msg}</p>}
            <p className="text-xs text-gray-500">
              Admin verifies your screenshot and approves the renewal. POS resumes on approval.
            </p>
          </form>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Payment History</h2>
        {!payments.length ? (
          <div className="text-gray-400 text-sm">No payments submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase">
                  <th className="py-2">Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Screenshot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2">{p.date}</td>
                    <td>{p.plan}</td>
                    <td>{inr(p.amount)}</td>
                    <td>
                      {p.screenshot_url ? (
                        <img src={p.screenshot_url} alt="" className="w-16 rounded-lg border" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : p.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
