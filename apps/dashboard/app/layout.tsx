import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HandOff Dashboard",
  description: "Paid agents with x402 receipts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
