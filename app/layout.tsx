import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Belvedere AI™ | Business Growth Advisor',
  description: 'AI-powered business growth advisor by Belvedere Marketing & PR. Get expert recommendations on marketing, PR, SEO, brand positioning, and more.',
  keywords: 'business growth, AI advisor, marketing strategy, PR, SEO, brand positioning, Belvedere',
  openGraph: {
    title: 'Belvedere AI™ | Business Growth Advisor',
    description: 'Get a personalized AI-powered business growth roadmap from Belvedere Marketing & PR.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
