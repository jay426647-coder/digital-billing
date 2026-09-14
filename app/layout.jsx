export const metadata = {
  title: 'Jal Pay - Panchayat Digital Billing',
  description: 'Panchayat digital billing management dashboard',
  icons: {
    icon: '/favicon-32.png',
    apple: '/logo192.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
