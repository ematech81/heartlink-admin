import './globals.css';

export const metadata = {
  title: 'HeartLink Admin',
  description: 'HeartLink Admin Control Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
