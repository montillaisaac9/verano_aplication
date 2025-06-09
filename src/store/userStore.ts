// src/store/userStore.ts
import { create } from 'zustand';
import { Session } from 'next-auth'; // Importa la interfaz Session de NextAuth.js
import { Student as PrismaStudent } from '@prisma/client'; // Importa UserRole y PrismaStudent

interface UserState {
  user: Session['user'] | null; // El usuario de la sesión de NextAuth.js
  isAuthenticated: boolean;
  studentFullDetails: PrismaStudent | null; // Usamos PrismaStudent directamente como tipo
  setUser: (user: Session['user'] | null) => void;
  setStudentFullDetails: (details: PrismaStudent | null) => void; // Tipo de detalle ajustado
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  studentFullDetails: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setStudentFullDetails: (details) => set({ studentFullDetails: details }),
  clearUser: () => set({ user: null, isAuthenticated: false, studentFullDetails: null }),
}));