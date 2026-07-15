import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistem Company",
  description: "Aplikasi Manajemen Bisnis & Keuangan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body 
        className="min-h-full flex flex-col antialiased bg-slate-50 text-slate-900 font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}