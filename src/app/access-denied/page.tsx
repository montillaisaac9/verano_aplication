// src/app/access-denied/page.tsx
'use client'; // This can be a Client Component if you want interactive elements

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, LogIn } from 'lucide-react'; // Import icons for better UX

const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-800 text-white p-6 text-center">
      <ShieldAlert size={80} className="mb-6 text-red-300 animate-bounce-slow" />
      <h1 className="text-5xl font-extrabold mb-4 animate-fade-in-down">Acceso Denegado</h1>
      <p className="text-xl mb-8 max-w-lg animate-fade-in">
        No tienes los permisos necesarios para ver esta página.
        Por favor, asegúrate de haber iniciado sesión con una cuenta autorizada.
      </p>
      <div className="flex space-x-4 animate-scale-in">
        <Link href="/auth/login" className="bg-white text-red-700 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center">
          <LogIn size={20} className="mr-2" /> Iniciar Sesión
        </Link>
        <Link href="/" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-red-700 transition-all duration-300 transform hover:scale-105">
          Ir a la Página de Inicio
        </Link>
      </div>
      <p className="mt-12 text-sm opacity-80">
        Si crees que esto es un error, contacta al administrador.
      </p>
    </div>
  );
};

export default AccessDeniedPage;