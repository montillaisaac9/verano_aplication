'use client';

import React from 'react';
import AuthLayout from '@/components/layouts/authlauout';
import { UserRole } from '@prisma/client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <AuthLayout allowedRoles={[UserRole.ADMIN]}>
      {children}
    </AuthLayout>
  );
};

export default AdminLayout;
