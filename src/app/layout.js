import './globals.css';

export const metadata = {
  title: 'HeartLink Admin',
  description: 'HeartLink Admin Control Panel',
  icons: {
    icon:  '/favicon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
