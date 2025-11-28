import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoJunk",
  description: "Field fossil & rock specimen inventory with Google Photos and Sheets integration."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <main className="max-w-5xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
