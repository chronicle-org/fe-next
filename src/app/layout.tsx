import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import NoSSRNavigation from "@/components/ui/NoSSRNavigation";
import ButtonBackToTop from "@/components/ui/ButtonBackToTop";
import Providers from "./provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chronicle",
  description: "Share your stories with the world.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/chronicle-icon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <ThemeProvider
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NoSSRNavigation />
            {children}
            <ButtonBackToTop />
            <Toaster position="top-right" richColors closeButton />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}