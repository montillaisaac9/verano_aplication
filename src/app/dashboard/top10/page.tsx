'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Top10Courses from '@/components/Top10Courses';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const Top10Page: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ranking de Cursos de Verano
            </h1>
            <p className="text-gray-600">
              Descubre los cursos más populares según las preferencias de los estudiantes.
              Este ranking se actualiza en tiempo real basado en las selecciones de todos los participantes.
            </p>
          </div>
        </div>

        {/* Top 10 Component */}
        <Top10Courses />

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ¿Cómo funciona el ranking?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">📊 Metodología</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Los cursos se ordenan por número de votos (selecciones)</li>
                <li>• La popularidad se calcula como porcentaje de ocupación</li>
                <li>• Se actualiza automáticamente con cada nueva inscripción</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🏆 Beneficios</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Identifica las materias más demandadas</li>
                <li>• Ayuda en la planificación de recursos</li>
                <li>• Facilita la toma de decisiones académicas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Top10Page;
