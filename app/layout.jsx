export const metadata = {
  title: 'Jal Pay - Panchayat Digital Billing',
  description: 'Panchayat digital billing management dashboard',
  manifest: '/manifest.json',
  themeColor: '#0d9488',
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
