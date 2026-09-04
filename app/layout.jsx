import LangToggle from '../components/LangToggle';

export const metadata = {
  title: 'Digital Billing - Panchayat Dashboard',
  description: 'Panchayat digital billing management dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LangToggle />
        {children}
      </body>
    </html>
  );
}
