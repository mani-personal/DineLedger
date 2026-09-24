'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const NAV = [
  ['/dashboard', '📊 Dashboard'],
  ['/dashboard/pos', '🛒 POS Billing'],
  ['/dashboard/pos-history', '🧾 POS History'],
  ['/dashboard/menu', '🍽️ Menu / Dishes'],
  ['/dashboard/bills', '🧾 Bills & Expenses'],
  ['/dashboard/reports', '📈 Reports'],
  ['/dashboard/subscription', '💳 Subscription'],
  ['/dashboard/settings', '⚙️ Settings']
];

export default function DashboardLayout({ children }) {
  const [me, setMe] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.session || d.session.role !== 'restaurant') {
          router.push('/login');
          return;
        }
        setMe(d.session.restaurant);
      });
  }, [router]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  if (!me) return <div className="p-8 text-gray-400">Loading…</div>;

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
        <div className="flex items-center justify-between bg-white border-b px-6 py-3 flex-wrap gap-2">
          <div className="font-semibold flex items-center gap-2">
            {me.logo_url && <img src={me.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
            {me.name}
            {!me.pos_active && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">POS Paused</span>
            )}
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
