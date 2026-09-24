import './globals.css';

export const metadata = {
  title: 'RestroBMS',
  description: 'Restaurant bill management'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
