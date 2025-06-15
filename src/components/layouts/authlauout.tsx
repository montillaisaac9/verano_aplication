// src/components/AuthLayout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { UserRole, Student as PrismaStudent } from '@prisma/client';
import { CircularProgress } from '../progres';
import { toast } from 'react-hot-toast';
import DefaultLayout from './defaultLayout';

import { Session } from 'next-auth';
import axios from 'axios';

interface AuthLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, allowedRoles }) => {
  const { data: session, status } = useSession() as { data: Session | null, status: string };
  const router = useRouter();
  const { setUser, clearUser, studentFullDetails, setStudentFullDetails } = useUserStore();
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Phase 1: Handle Authentication Status
    if (status === 'authenticated' && session?.user) {
      setUser(session.user);
      console.log('DEBUG: Authenticated session user role:', session.user.role);

      // Phase 2: Fetch Student Specific Data (if applicable)
      if (session.user.role === 'STUDENT' && !studentFullDetails) {
         const fetchStudentDetails = async (userId: string) => {
    setIsLoadingDetails(true);
    try {
      const response = await axios.get<PrismaStudent>(`/api/student/?userId=${userId}`);
      setStudentFullDetails(response.data);
    } catch (error: unknown) {
      console.error('Error al cargar detalles del estudiante:', error);
      toast.error(
        error?.response?.data?.message || 'Error inesperado al cargar datos de estudiante.'
      );
      clearUser();
      router.push('/auth/login');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  fetchStudentDetails(session.user.id);
      }
    } else if (status === 'unauthenticated') {
      clearUser();
      // Only redirect if not already on these pages and not already redirecting
      if (
        !isRedirecting &&
        window.location.pathname !== '/auth/login' &&
        window.location.pathname !== '/auth/register' &&
        window.location.pathname !== '/access-denied'
      ) {
        setIsRedirecting(true);
        router.push('/auth/login');
      }
    }
  }, [status, session, setUser, clearUser, setStudentFullDetails, router, studentFullDetails, isRedirecting]);

  // Phase 3: Show Loading State
  if (status === 'loading' || isLoadingDetails || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <CircularProgress />
        <p className="ml-3 text-gray-700">Cargando sesión y datos de usuario...</p>
      </div>
    );
  }

  // If unauthenticated and not loading, the user has already been redirected.
  // Or if we are already redirecting, prevent further rendering
  if (status === 'unauthenticated' && !session?.user || isRedirecting) {
    return null;
  }

  // Phase 4: Role-Based Authorization
  if (session?.user && allowedRoles && allowedRoles.length > 0) {
    const userRole = session.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      console.warn(`Access Denied: Role ${userRole} not permitted for this route. Allowed:`, allowedRoles);
      if (!isRedirecting) {
        setIsRedirecting(true);
        toast.error('No tienes permiso para acceder a esta página.');
        router.push('/access-denied');
      }
      return null;
    }
  }

  // Phase 5: Render DefaultLayout with the user's role
  return session && session.user ? (
    <DefaultLayout userRole={session.user.role as UserRole}>{children}</DefaultLayout>
  ) : null;
};

export default AuthLayout;