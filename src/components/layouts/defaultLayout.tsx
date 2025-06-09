// src/components/layouts/defaultLayout.tsx
'use client'; // This component will be a Client Component

import React from 'react';
import Navbar from './navbar'; // This will be the single Navbar
import Footer from './footer'; // This will be the single Footer
import { UserRole } from '@prisma/client'; // Import UserRole for typing

interface DefaultLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole; // Optional because public pages might use it too, but AuthLayout always passes it
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Conditionally render Navbar based on userRole presence/type */}
      {userRole ? (
        <Navbar role={userRole} /> // Pass the userRole to the Navbar
      ) : (
        // You might want a simple, public Navbar for unauthenticated users,
        // or just omit it for certain public pages.
        // For now, let's include a basic one if no role is provided (e.g., for / page)
        <nav className="bg-gray-800 p-4 text-white text-center">
          <p className="text-xl font-semibold">Welcome Guest</p>
          <div className="mt-2">
            <a href="/auth/login" className="text-blue-300 hover:underline mx-2">Sign In</a>
            <a href="/auth/register" className="text-blue-300 hover:underline mx-2">Register</a>
          </div>
        </nav>
      )}

      <main className="flex-grow container mx-auto p-6">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default DefaultLayout;