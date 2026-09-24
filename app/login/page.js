'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState('restaurant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, email, password })
    });
    setLoading(false);
    if (!res.ok) {
      setErr('Invalid credentials.');
      return;
    }
    router.push(role === 'admin' ? '/admin' : '/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-bold mb-1">🧾 RestroBMS</h1>
        <p className="text-sm text-gray-500 mb-4">Sign in to manage your restaurant's billing.</p>

        <div className="flex bg-gray-100 rounded-full p-1 mb-4">
          <button
            type="button"
            onClick={() => setRole('restaurant')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              role === 'restaurant' ? 'bg-indigo-600 text-white' : 'text-gray-500'
            }`}
          >
            Restaurant
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2 rounded-full text-sm font-semibold ${
              role === 'admin' ? 'bg-indigo-600 text-white' : 'text-gray-500'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500">Email</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Password</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white rounded-lg py-2 font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          After running <code>npm run seed</code>: admin@restrobms.com / admin123, or spice@demo.com / demo123
        </p>
      </div>
    </div>
  );
}
