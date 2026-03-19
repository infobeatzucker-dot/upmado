import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UpMaDo – AI-Powered Professional Audio Mastering",
  description:
    "Upload your track. Get a professional master in seconds. AI-powered mastering at Ozone / Fabfilter quality.",
  keywords: ["audio mastering", "AI mastering", "online mastering", "music production"],
  openGraph: {
    title: "UpMaDo",
    description: "AI-Powered Professional Audio Mastering",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased noise-bg">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
