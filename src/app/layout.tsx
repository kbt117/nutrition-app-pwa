import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "NutriScan — Food Nutrition Lookup",
  description:
    "Search any food to get detailed nutrition facts including sodium, sugar, fat breakdown, GMO & organic info.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
