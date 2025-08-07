
'use client'

import type { Metadata } from "next";
import { Inter, Space_Mono, Roboto_Mono, Inconsolata } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ['400', '700'], variable: '--font-space-mono' });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: '--font-roboto-mono' });
const inconsolata = Inconsolata({ subsets: ["latin"], variable: '--font-inconsolata' });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-hue', theme.primaryColor.h.toString());
    document.documentElement.style.setProperty('--primary-saturation', `${theme.primaryColor.s}%`);
    document.documentElement.style.setProperty('--primary-lightness', `${theme.primaryColor.l}%`);
  }, [theme.primaryColor]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
          inter.variable,
          spaceMono.variable,
          robotoMono.variable,
          inconsolata.variable,
          theme.fontFamily
        )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
