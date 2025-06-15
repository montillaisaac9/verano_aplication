// src/app/(protected)/dashboard/page.tsx
'use client'; // Este componente necesita ser un Client Component para usar hooks de Zustand

import React from 'react';
import { useUserStore } from '@/store/userStore'; // Importa tu store de Zustand
import { LineChart, Users, BookOpen, GraduationCap, TrendingUp, Settings, UserCheck, FileText } from 'lucide-react'; // Iconos de Lucide React
import Link from 'next/link';

const DashboardPage: React.FC = () => {
  const { user, studentFullDetails } = useUserStore(); // Accede a los datos del usuario y detalles de estudiante


  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center py-8 px-4">
      {/* Contenedor principal con efecto de tarjeta y fondo */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl w-full mx-auto">
        <div className="p-8 md:p-12">
          {/* Encabezado del Dashboard */}
          <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-6 animate-fade-in-down">
            Bienvenido a tu Dashboard, <span className="text-blue-600">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-xl text-gray-600 text-center mb-10 animate-fade-in">
            Tu rol actual es: <span className="font-semibold text-blue-700">{user?.role}</span>.
            Aquí tienes un resumen de tus opciones y datos importantes.
          </p>

          {/* Sección de Resumen Dinámica por Rol */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Tarjeta de Información General */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Estado General</h3>
                <LineChart size={32} />
              </div>
              <p className="text-lg">Accede a tus estadísticas y progresos.</p>
              <Link href="/dashboard/stats" className="mt-4 inline-block bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Ver Estadísticas
              </Link>
            </div>

            {/* Top 10 Cursos - Visible para todos */}
            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">Top 10 Cursos</h3>
                <TrendingUp size={32} />
              </div>
              <p className="text-lg">Descubre los cursos más populares.</p>
              <Link href="/dashboard/top10" className="mt-4 inline-block bg-white text-yellow-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Ver Ranking
              </Link>
            </div>

            {user?.role === 'STUDENT' && (
              <>
                <div className="bg-gradient-to-br from-teal-500 to-green-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Preselección de Cursos</h3>
                    <BookOpen size={32} />
                  </div>
                  <p className="text-lg">Selecciona tus 2 cursos preferidos para el período de verano.</p>
                  <Link href="/dashboard/form" className="mt-4 inline-block bg-white text-green-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Hacer Preselección
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-right">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Mi Perfil</h3>
                    <GraduationCap size={32} />
                  </div>
                  {studentFullDetails ? (
                    <p className="text-lg">Nombre: {studentFullDetails.name} {studentFullDetails.lastName}</p>
                  ) : (
                    <p className="text-lg">Cargando detalles de tu perfil...</p>
                  )}
                  <Link href="/dashboard/profile" className="mt-4 inline-block bg-white text-orange-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Ver Perfil
                  </Link>
                </div>
              </>
            )}
            {(user?.role.toUpperCase() === 'PROFESSOR' || user?.role.toUpperCase() === 'ADMIN') && (
              <>
                <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Gestión de Cursos</h3>
                    <BookOpen size={32} />
                  </div>
                  <p className="text-lg">Administra los cursos y asignaciones.</p>
                  <Link href="/admin" className="mt-4 inline-block bg-white text-pink-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Gestionar Cursos
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-right">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Reportes</h3>
                    <FileText size={32} />
                  </div>
                  <p className="text-lg">Visualiza estadísticas y reportes.</p>
                  <Link href="/admin/reports" className="mt-4 inline-block bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Ver Reportes
                  </Link>
                </div>
              </>
            )}
            {user?.role.toUpperCase() === 'ADMIN' && (
              <>
                <div className="bg-gradient-to-br from-slate-600 to-slate-800 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Panel Admin</h3>
                    <Settings size={32} />
                  </div>
                  <p className="text-lg">Administración completa del sistema.</p>
                  <Link href="/admin" className="mt-4 inline-block bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Ir al Panel
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Gestión de Perfiles</h3>
                    <UserCheck size={32} />
                  </div>
                  <p className="text-lg">Administra usuarios y perfiles.</p>
                  <Link href="/admin/profiles" className="mt-4 inline-block bg-white text-teal-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Gestionar Perfiles
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Sección de Acciones Rápidas */}
          <div className="bg-gray-100 rounded-xl p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Acciones Rápidas</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard/stats" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                📊 Estadísticas
              </Link>
              <Link href="/dashboard/top10" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                🏆 Ver Top 10
              </Link>
              {user?.role === 'STUDENT' && (
                <>
                  <Link href="/dashboard/form" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                    📝 Hacer Preselección
                  </Link>
                  <Link href="/dashboard/profile" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                    👤 Mi Perfil
                  </Link>
                </>
              )}
              {user?.role.toUpperCase() === 'ADMIN' && (
                <>
                  <Link href="/admin" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                    ⚙️ Panel Admin
                  </Link>
                  <Link href="/admin/profiles" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                    👥 Gestionar Perfiles
                  </Link>
                  <Link href="/admin/reports" className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                    📋 Reportes
                  </Link>
                </>
              )}
              {(user?.role.toUpperCase() === 'PROFESSOR' || user?.role.toUpperCase() === 'ADMIN') && (
                <Link href="/dashboard/courses" className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md">
                  📚 Gestionar Cursos
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;