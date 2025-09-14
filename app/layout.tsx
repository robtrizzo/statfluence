import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Providers from "@/providers/providers";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Statfluence",
  description: "Sports analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <div className="p-4">
          <div className="mb-6 text-center">
            <Link href="/">
              <Image
                src="/statfluence-primary-logo-full-color.png"
                alt="Statfluence"
                width={180}
                height={40}
                priority
              />
            </Link>
          </div>
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
