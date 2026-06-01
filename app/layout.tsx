import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qualia",
  description:
    "Qualia is an AI lead qualification assistant with live scoring and sales-readiness tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#08111f]">{children}</body>
    </html>
  );
}
