// src/types/index.d.ts (Actualización necesaria)

// Importa directamente los tipos generados por Prisma
import {
  User as PrismaUser,
  Student as PrismaStudent,
  Course as PrismaCourse,
  CourseSelection as PrismaCourseSelection,
  UserRole,
} from '@prisma/client';

export type User = PrismaUser;
export type Student = PrismaStudent;
export type Course = PrismaCourse;
export type CourseSelection = PrismaCourseSelection;

// Define StudentDetails si no la tienes ya (debe coincidir con PrismaStudent si la obtienes de ahí)
// Usaremos PrismaStudent directamente para los detalles si eso es lo que la API devuelve.
// Si tu API retorna un subconjunto específico, define una interfaz para ese subconjunto.
// Para simplificar, asumiremos que los detalles son los de PrismaStudent.
// Si tu API retorna solo algunos campos, crea una interfaz más específica:
/*
export interface StudentDetails {
  id: string;
  email: string;
  name: string;
  lastName: string;
  idCard: string;
  age: number;
  major: string;
  semester: number;
  // ... otros campos que tu API devuelva para el estudiante
}
*/


import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role: UserRole;
      studentDetails?: PrismaStudent; // <--- ¡Importante! Añadir los detalles del estudiante aquí
    };
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: UserRole;
  }
}