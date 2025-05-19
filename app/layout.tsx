import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Promptie",
  description: "A tool for testing prompts and generations with Ragie",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col max-w-4xl mx-auto h-full p-4">
          <header className="flex items-center justify-between pb-4">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold">Promptie</h1>
                <p className="text-sm text-gray-500">
                  A tool for testing prompts and generations with Ragie
                </p>
              </div>
              {/* <div className="flex gap-8">
                <Link href="/">Generate</Link>
                <Link href="/search">Search</Link>
              </div> */}
          </header>
          <main className="flex flex-col w-full h-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
