'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  ['/admin', '🏬 Restaurants'],
  ['/admin/approvals', '✅ Approvals']
];

export default function AdminLayout({ children }) {
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.session || d.session.role !== 'admin') {
          router.push('/login');
          return;
        }
        setReady(true);
      });
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!ready) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-gray-300 p-3 shrink-0">
        <div className="text-white font-bold text-lg px-2 py-3">🧾 RestroBMS</div>
        <nav className="space-y-1">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                pathname === href ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between bg-white border-b px-6 py-3">
          <div className="font-semibold">
            Admin Console <span className="text-gray-400 font-normal text-sm block">Platform management</span>
          </div>
          <button onClick={logout} className="text-sm border rounded-lg px-3 py-1.5">
            Log out
          </button>
        </div>
        <div className="p-6 max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
