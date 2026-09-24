'use client';
import { useEffect, useState } from 'react';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [saving, setSaving] = useState(false);

  function load() {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => setMenu(d.menu || []));
  }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const form = e.target;
    const f = new FormData(form);
    let image_url = null;

    const file = form.image.files[0];
    if (file) {
      const uf = new FormData();
      uf.append('file', file);
      uf.append('folder', 'dishes');
      const up = await fetch('/api/upload', { method: 'POST', body: uf }).then((r) => r.json());
      image_url = up.url;
    }

    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: f.get('name'),
        category: f.get('category'),
        price: Number(f.get('price')),
        image_url
      })
    });
    form.reset();
    setSaving(false);
    load();
  }

  async function removeDish(id) {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      <div className="bg-white border rounded-2xl p-5 mb-5">
        <h2 className="font-semibold mb-3">Add Dish</h2>
        <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
          <Field label="Dish Name">
            <input name="name" required placeholder="e.g. Paneer Tikka" className="border rounded-lg px-3 py-2" />
          </Field>
          <Field label="Category">
            <input name="category" required placeholder="e.g. Starters" className="border rounded-lg px-3 py-2" />
          </Field>
          <Field label="Price (₹)">
            <input name="price" type="number" min="1" required className="border rounded-lg px-3 py-2 w-28" />
          </Field>
          <Field label="Photo">
            <input name="image" type="file" accept="image/*" className="text-sm" />
          </Field>
          <button disabled={saving} className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60">
            {saving ? 'Saving…' : 'Add Dish'}
          </button>
        </form>
      </div>

      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Menu ({menu.length} dishes)</h2>
        {!menu.length ? (
          <div className="text-gray-400 text-sm">No dishes added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase">
                  <th className="py-2"></th>
                  <th>Dish</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {menu.map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="py-2">
                      {d.image_url ? (
                        <img src={d.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{d.name}</td>
                    <td>{d.category}</td>
                    <td>{inr(d.price)}</td>
                    <td>
                      <button onClick={() => removeDish(d.id)} className="text-xs bg-red-600 text-white rounded-lg px-2 py-1">
                        Remove
                      </button>
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

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      {children}
    </div>
  );
}
