// src/components/layouts/Navbar.tsx
'use client'; // This is a Client Component because it uses Link and signOut

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useUserStore } from '@/store/userStore'; // Import your Zustand store
import { UserRole } from '@prisma/client'; // Import UserRole enum from Prisma

interface NavbarProps {
  role: UserRole | 'UNKNOWN'; // Use Prisma's UserRole for strong typing
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {
  const clearUser = useUserStore((state) => state.clearUser);

  const handleSignOut = async () => {
    // Clear user state in Zustand before signing out from NextAuth
    clearUser();
    await signOut({ callbackUrl: '/auth/login' }); // Redirect to login after sign out
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-white text-2xl font-bold tracking-wide">
          Cursos de Verano
        </Link>
        <ul className="flex space-x-6 items-center">
          {role === 'STUDENT' && (
            <>
              <li>
                <Link href="/dashboard/form" className="text-white hover:text-blue-200 transition-colors duration-200">
                  Cursos mas votados
                </Link>
              </li>
              <li>
              </li>
            </>
          )}
          {(role === 'PROFESSOR' || role === 'ADMIN') && (
            <>
              <li>
                <Link href="/admin" className="text-white hover:text-blue-200 transition-colors duration-200">
                  Lista de Cursos
                </Link>
              </li>
              <li>
                <Link href="/admin/profiles" className="text-white hover:text-blue-200 transition-colors duration-200">
                  Estudiantes
                </Link>
              </li>
              {/* Add more links for Admin/Professor roles here */}
            </>
          )}
          {role !== 'UNKNOWN' && ( // Show logout button only if authenticated
            <li>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Cerrar Sesión
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;