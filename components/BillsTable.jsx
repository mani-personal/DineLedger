'use client';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export default function BillsTable({ bills, onPrint }) {
  if (!bills || !bills.length) {
    return <div className="text-gray-400 text-sm py-2">No entries yet.</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-left text-gray-500 text-xs uppercase">
            <th className="py-2">Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Note</th>
            <th>Amount</th>
            {onPrint && <th></th>}
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.id} className="border-t">
              <td className="py-2 whitespace-nowrap">{b.date}</td>
              <td className="whitespace-nowrap">
                {b.type === 'revenue' ? (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Revenue</span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">Expense</span>
                )}
              </td>
              <td className="whitespace-nowrap">{b.category || '—'}</td>
              <td>{b.note}</td>
              <td className="whitespace-nowrap">
                {b.type === 'expense' ? '-' : ''}
                {inr(b.amount)}
              </td>
              {onPrint && (
                <td>
                  <button onClick={() => onPrint(b)} className="text-xs border rounded-lg px-2 py-1">
                    🖨️ Print
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
