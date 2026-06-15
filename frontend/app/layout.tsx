import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leave Management System",
  description: "LMS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}