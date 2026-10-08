import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevEx Platform - Unified Architecture Map & Onboarding Guide',
  description: 'Deterministic dual-pane onboarding dashboard featuring interactive 60fps React Flow architecture graphs and GraphRAG step-by-step micro guides.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-dark-950 text-slate-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
