'use client';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Renders a hidden receipt that only becomes visible via the print media
// query in globals.css. Call printReceipt() after mounting this once per
// page (e.g. in a POS or Bills page) to trigger window.print().
export default function Receipt({ restaurantName, bill }) {
  if (!bill) return null;
  return (
    <div id="print-area" className="hidden">
      <div className="font-mono text-sm max-w-xs">
        <h2 className="font-bold text-base m-0">{restaurantName}</h2>
        <div>{bill.date}</div>
        <hr className="border-dashed my-2" />
        <div className="flex justify-between">
          <span>{bill.type === 'revenue' ? 'Sale' : 'Expense'}</span>
          <span>{bill.category || ''}</span>
        </div>
        <div className="my-2">{bill.note}</div>
        <hr className="border-dashed my-2" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>
            {bill.type === 'expense' ? '-' : ''}
            {inr(bill.amount)}
          </span>
        </div>
        <hr className="border-dashed my-2" />
        <div className="text-center text-xs">Thank you — RestroBMS</div>
      </div>
    </div>
  );
}

export function printReceipt() {
  window.print();
}
