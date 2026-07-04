import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korda — Reality Intelligence for Agent Systems",
  description: "Korda watches agent memory, catches semantic drift, and keeps orchestrators anchored to what is true.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
