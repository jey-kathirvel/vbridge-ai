import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "V-BRIDGE AI LAB",
  description:
    "Apollo.io-powered AI research and validation platform owned by V Strat Team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
