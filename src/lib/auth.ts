// src/lib/auth.ts

import { AuthOptions } from "next-auth"; // Usamos AuthOptions, que es el tipo más reciente
import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs"; // NO USAR, POR SOLICITUD DEL USUARIO, PERO ES INSEGURO PARA PRODUCCIÓN
import { UserRole, PrismaClient } from "@prisma/client"; // Importa UserRole directamente de @prisma/client
// Ya no necesitamos importar 'User' de '@/types' aquí porque los tipos de Prisma ya están haciendo el trabajo

const prisma = new PrismaClient();

interface IncomingCredentials {
  email?: string;
  password?: string;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials: IncomingCredentials): Promise<{ id: string; email: string; role: UserRole } | null> {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Credenciales incompletas.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        // ADVERTENCIA DE SEGURIDAD: Comparación de contraseñas sin hashing. ¡INSEGURO PARA PRODUCCIÓN!
        const isPasswordValid = credentials.password === user.password;

        if (!isPasswordValid) {
          throw new Error("Correo o contraseña incorrectos.");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
