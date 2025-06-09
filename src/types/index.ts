// src/types/index.d.ts

// Importa directamente los tipos generados por Prisma
// Asegúrate de haber ejecutado 'npx prisma generate' para que estos tipos existan
import {
  User as PrismaUser,
  Student as PrismaStudent,
  Course as PrismaCourse,
  CourseSelection as PrismaCourseSelection,
  UserRole, // UserRole ya se importa directamente
} from '@prisma/client';

// Re-exporta los tipos de Prisma si quieres usarlos con nombres más cortos
export type User = PrismaUser;
export type Student = PrismaStudent;
export type Course = PrismaCourse;
export type CourseSelection = PrismaCourseSelection;
// No es necesario exportar 'UserRole' de nuevo aquí, ya se importa y se usa.

// Extensión de tipos para NextAuth.js
// Esto es crucial para que TypeScript sepa que la sesión y el token JWT
// pueden contener el 'id' y el 'role' del usuario.
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role: UserRole; // Usa el Enum de Prisma para el rol
    };
  }

  interface User {
    id: string;
    email: string;
    role: UserRole; // Usa el Enum de Prisma
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: UserRole; // Usa el Enum de Prisma
  }
}