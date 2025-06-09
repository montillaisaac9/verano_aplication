// src/components/NextAuthSessionProvider.tsx
// ¡ESTE ARCHIVO DEBES CREARLO!
'use client'; // <-- Esta directiva es CRUCIAL. Hace que este sea un Client Component.

import { SessionProvider } from 'next-auth/react';
import React from 'react';

interface NextAuthSessionProviderProps {
  children: React.ReactNode;
}

export const NextAuthSessionProvider: React.FC<NextAuthSessionProviderProps> = ({ children }) => {

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
};