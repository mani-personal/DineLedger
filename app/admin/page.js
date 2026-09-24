'use client';
import { useEffect, useState } from 'react';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  function load() {
    fetch('/api/admin/restaurants')
      .then((r) => r.json())
      .then((d) => setRestaurants(d.restaurants || []));
  }
  useEffect(load, []);

  async function createRestaurant(e) {
    e.preventDefault();
    setCreating(true);
    const f = new FormData(e.target);
    setError('');
    const res = await fetch('/api/admin/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.get('name'),
        email: f.get('email'),
        password: f.get('password'),
        plan: f.get('plan')
      })
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Could not create restaurant');
      setCreating(false);
      return;
    }
    e.target.reset();
    setCreating(false);
    load();
  }

  async function togglePos(r) {
    await fetch(`/api/admin/restaurants/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pos_active: !r.pos_active })
    });
    load();
  }

  return (
    <div>
      <div className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold mb-3">Add New Restaurant</h2>
        <form onSubmit={createRestaurant} className="flex flex-wrap gap-3 items-end">
          <Field label="Restaurant Name">
            <input name="name" required className="border rounded-lg px-3 py-2" />
          </Field>
          <Field label="Login Email">
            <input name="email" type="email" required className="border rounded-lg px-3 py-2" />
          </Field>
          <Field label="Password">
            <input name="password" type="password" minLength={12} required className="border rounded-lg px-3 py-2" />
          </Field>
          <Field label="Plan">
            <select name="plan" className="border rounded-lg px-3 py-2">
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </Field>
          <button disabled={creating} className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60">
            {creating ? 'Creating…' : 'Create Restaurant'}
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">All Restaurants</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase">
                <th className="py-2"></th>
                <th>Restaurant</th>
                <th>Login Email</th>
                <th>Plan</th>
                <th>Subscription</th>
                <th>Expiry</th>
                <th>POS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">
                    {r.logo_url ? <img src={r.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" /> : '—'}
                  </td>
                  <td className="font-semibold">{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.plan}</td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.sub_status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : r.sub_status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.sub_status}
                    </span>
                  </td>
                  <td>{r.expiry}</td>
                  <td>
                    {r.pos_active ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Active</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">Paused</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => togglePos(r)}
                      className={`text-xs rounded-lg px-2 py-1 ${
                        r.pos_active ? 'bg-red-600 text-white' : 'bg-gray-100 border'
                      }`}
                    >
                      {r.pos_active ? 'Pause POS' : 'Resume POS'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
