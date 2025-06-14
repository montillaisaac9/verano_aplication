// src/app/layout.tsx
// ¡NO 'use client' aquí! Este archivo debe permanecer como un Server Component.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { NextAuthSessionProvider } from '@/components/NextAuthSessionProvider'; // <-- ¡Ahora sí existe y lo importas!

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata puede permanecer aquí porque este es un Server Component.
export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
        <Toaster />
        {/*
          Tu aplicación entera (representada por {children}) ahora está envuelta
          por NextAuthSessionProvider, que es un Client Component.
          Esto provee el contexto de SessionProvider necesario para useSession().
        */}
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}