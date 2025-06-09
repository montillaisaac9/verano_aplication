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
        <Link href="/" className="text-white text-2xl font-bold tracking-wide">
          Summer Courses
        </Link>
        <ul className="flex space-x-6 items-center">
          {role === 'STUDENT' && (
            <>
              <li>
                <Link href="/student/enroll" className="text-white hover:text-blue-200 transition-colors duration-200">
                  Enroll
                </Link>
              </li>
              <li>
                <Link href="/student/top-courses" className="text-white hover:text-blue-200 transition-colors duration-200">
                  Top Courses
                </Link>
              </li>
            </>
          )}
          {(role === 'PROFESSOR' || role === 'ADMIN') && (
            <>
              <li>
                <Link href="/dashboard/courses" className="text-white hover:text-blue-200 transition-colors duration-200">
                  Courses List
                </Link>
              </li>
              <li>
                <Link href="/dashboard/students" className="text-white hover:text-blue-200 transition-colors duration-200">
                  Students
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
                Sign Out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;