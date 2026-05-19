import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyBook Market Admin",
  description: "Admin dashboard for MyBook Market inventory and orders.",
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
