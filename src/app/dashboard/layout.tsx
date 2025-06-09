// src/app/(protected)/layout.tsx
// Este es un Server Component por defecto, pero renderizará un Client Component (AuthLayout).
import React from 'react';
import AuthLayout from '@/components/layouts/authlauout'; // Importa tu AuthLayout
import { UserRole } from '@prisma/client'; // Importa UserRole para definir los roles permitidos

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// DEFINE AQUI LOS ROLES PERMITIDOS PARA TODO EL GRUPO DE RUTAS PROTEGIDAS.
// Si quieres que PROFESSOR y ADMIN puedan acceder al dashboard y otras rutas protegidas,
// DEBES INCLUIR ESOS ROLES EN ESTE ARRAY.
const PROTECTED_APP_ROLES: UserRole[] = ['STUDENT', 'PROFESSOR', 'ADMIN']; // <-- ENSURE ALL DESIRED ROLES ARE HERE

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  return (
    // Envuelve todas las rutas dentro de (protected) con tu AuthLayout
    <AuthLayout allowedRoles={PROTECTED_APP_ROLES}>
      {children}
    </AuthLayout>
  );
};

export default ProtectedLayout;