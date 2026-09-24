'use client';
import { useEffect, useState } from 'react';
import Receipt, { printReceipt } from '@/components/Receipt';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function PosPage() {
  const [menu, setMenu] = useState([]);
  const [me, setMe] = useState(null);
  const [cart, setCart] = useState({}); // dishId -> qty
  const [printBill, setPrintBill] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((d) => setMenu(d.menu || []));
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setMe(d.session?.restaurant));
  }, []);

  function add(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function inc(id) {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function dec(id) {
    setCart((c) => {
      const n = { ...c };
      n[id] = (n[id] || 0) - 1;
      if (n[id] <= 0) delete n[id];
      return n;
    });
  }

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ dish: menu.find((d) => d.id === id), qty }))
    .filter((x) => x.dish);
  const total = cartItems.reduce((s, x) => s + Number(x.dish.price) * x.qty, 0);

  async function checkout() {
    setError('');
    const res = await fetch('/api/pos/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems.map((x) => ({ dishId: x.dish.id, qty: x.qty })) })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Checkout failed');
      return;
    }
    setCart({});
    setPrintBill(data.bill);
    setTimeout(printReceipt, 150);
  }

  if (me && !me.pos_active) {
    return (
      <div className="bg-white border rounded-2xl p-6 text-gray-500">
        POS billing is paused. Renew your subscription to start billing sales.
      </div>
    );
  }
  if (!menu.length) {
    return (
      <div className="bg-white border rounded-2xl p-6 text-gray-500">
        Add dishes to your Menu first to start billing.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Select Dishes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {menu.map((d) => (
            <button
              key={d.id}
              onClick={() => add(d.id)}
              className="border rounded-xl p-3 text-left hover:border-indigo-500 bg-gray-50"
            >
              {d.image_url && <img src={d.image_url} alt="" className="w-full h-16 object-cover rounded-lg mb-2" />}
              <div className="font-semibold text-sm">{d.name}</div>
              <div className="text-xs text-gray-500 uppercase">{d.category}</div>
              <div className="text-indigo-600 font-bold mt-1">{inr(d.price)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5 h-fit sticky top-4">
        <h2 className="font-semibold mb-3">Current Bill</h2>
        {!cartItems.length ? (
          <div className="text-gray-400 text-sm">No items yet — tap a dish to add.</div>
        ) : (
          cartItems.map((x) => (
            <div key={x.dish.id} className="flex justify-between items-center py-2 border-t text-sm">
              <span>{x.dish.name}</span>
              <span className="flex items-center gap-2">
                <button onClick={() => dec(x.dish.id)} className="w-6 h-6 border rounded font-bold">
                  −
                </button>
                {x.qty}
                <button onClick={() => inc(x.dish.id)} className="w-6 h-6 border rounded font-bold">
                  +
                </button>
              </span>
            </div>
          ))
        )}
        <div className="flex justify-between font-bold text-lg py-3 border-t mt-2">
          <span>Total</span>
          <span>{inr(total)}</span>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button
          disabled={!cartItems.length}
          onClick={checkout}
          className="w-full bg-indigo-600 text-white rounded-lg py-2 font-semibold disabled:opacity-50"
        >
          Complete Sale
        </button>
      </div>

      <Receipt restaurantName={me?.name} bill={printBill} />
    </div>
  );
}
