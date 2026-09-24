'use client';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [me, setMe] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.session?.restaurant));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const form = e.target;
    const f = new FormData(form);
    let logo_url;

    const file = form.logo.files[0];
    if (file) {
      const uf = new FormData();
      uf.append('file', file);
      uf.append('folder', 'logos');
      const up = await fetch('/api/upload', { method: 'POST', body: uf }).then((r) => r.json());
      logo_url = up.url;
    }

    const body = { name: f.get('name'), email: f.get('email') };
    if (f.get('password')) body.password = f.get('password');
    if (logo_url) body.logo_url = logo_url;

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMe(data.restaurant);
      setMsg('Saved.');
    } else {
      setMsg(data.error || 'Could not save.');
    }
  }

  if (!me) return null;

  return (
    <div className="bg-white border rounded-2xl p-5 max-w-lg">
      <h2 className="font-semibold mb-3">Restaurant Profile</h2>
      <form onSubmit={submit} className="space-y-3">
        <Field label="Restaurant Name">
          <input name="name" defaultValue={me.name} className="border rounded-lg px-3 py-2 w-full" />
        </Field>
        <Field label="Login Email">
          <input name="email" defaultValue={me.email} className="border rounded-lg px-3 py-2 w-full" />
        </Field>
        <Field label="New Password (leave blank to keep current)">
          <input name="password" type="password" className="border rounded-lg px-3 py-2 w-full" />
        </Field>
        <Field label="Logo">
          <input name="logo" type="file" accept="image/*" />
        </Field>
        {me.logo_url && <img src={me.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border" />}
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        <button disabled={saving} className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
