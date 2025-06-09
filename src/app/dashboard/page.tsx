// src/app/(protected)/dashboard/page.tsx
'use client'; // Este componente necesita ser un Client Component para usar hooks de Zustand

import React from 'react';
import { useUserStore } from '@/store/userStore'; // Importa tu store de Zustand
import { LineChart, Users, BookOpen, GraduationCap, Link } from 'lucide-react'; // Iconos de Lucide React

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
              <a href="/dashboard/stats" className="mt-4 inline-block bg-white text-purple-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Ver Estadísticas
              </a>
            </div>
            {user?.role === 'STUDENT' && (
              <>
                <div className="bg-gradient-to-br from-teal-500 to-green-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Votacion de Verano</h3>
                    <BookOpen size={32} />
                  </div>
                  {studentFullDetails ? (
                    <p className="text-lg">Estás inscrito en {studentFullDetails.semester ? `el semestre ${studentFullDetails.semester}` : 'varios cursos'}.</p>
                  ) : (
                    <p className="text-lg">Cargando tus cursos inscritos...</p>
                  )}
                  <a href="/dashobard/form" className="mt-4 inline-block bg-white text-green-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Inscribir Materias
                  </a>
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
                  <a href="/student/profile" className="mt-4 inline-block bg-white text-orange-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Ver Perfil
                  </a>
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
                  <Link href="/dashboard/courses" className="mt-4 inline-block bg-white text-pink-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Gestionar Cursos
                  </Link>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 animate-slide-in-right">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Gestión de Usuarios</h3>
                    <Users size={32} />
                  </div>
                  <p className="text-lg">Supervisa y gestiona cuentas de estudiantes y profesores.</p>
                  <Link href="/dashboard/students" className="mt-4 inline-block bg-white text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    Gestionar Usuarios
                  </Link>
                </div>
              </>
            )}
             {user?.role === 'STUDENT' && (
              <>
                
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;