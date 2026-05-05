import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TollGate Bazaar Dashboard",
  description: "x402-powered agent commerce timeline",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
