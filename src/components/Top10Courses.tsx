'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, TrendingUp, Star, Medal, Award } from 'lucide-react';

interface CourseStats {
  id: string;
  name: string;
  capacity: number;
  votes: number;
  popularity: number;
  createdAt: string;
}

interface Top10Data {
  top10: CourseStats[];
  stats: {
    totalCourses: number;
    totalVotes: number;
    averageVotes: number;
    mostPopular: CourseStats | null;
  };
}

const Top10Courses: React.FC = () => {
  const [data, setData] = useState<Top10Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTop10();
  }, []);

  const fetchTop10 = async () => {
    try {
      const response = await fetch('/api/courses/stats');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError('Error al cargar estadísticas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankBadge = (position: number) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    
    switch (position) {
      case 1:
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 2:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
      case 3:
        return `${baseClasses} bg-amber-100 text-amber-800 border border-amber-200`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchTop10}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.top10.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top 10 Cursos Más Populares
        </h2>
        <p className="text-gray-500 text-center py-8">
          No hay cursos disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Top 10 Cursos Más Populares
        </h2>
        <p className="text-blue-100 mt-1">
          Basado en {data.stats.totalVotes} votos de estudiantes
        </p>
      </div>

      {/* Stats Summary */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.totalCourses}</p>
            <p className="text-sm text-gray-600">Cursos Totales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.totalVotes}</p>
            <p className="text-sm text-gray-600">Votos Totales</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.averageVotes}</p>
            <p className="text-sm text-gray-600">Promedio por Curso</p>
          </div>
        </div>
      </div>

      {/* Top 10 List */}
      <div className="divide-y divide-gray-200">
        {data.top10.map((course, index) => {
          const position = index + 1;
          const percentage = data.stats.totalVotes > 0 
            ? Math.round((course.votes / data.stats.totalVotes) * 100) 
            : 0;

          return (
            <div 
              key={course.id} 
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                position <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rank Icon */}
                  <div className="flex-shrink-0">
                    {getRankIcon(position)}
                  </div>
                  
                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {course.name}
                      </h3>
                      <span className={getRankBadge(position)}>
                        #{position}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.votes} votos
                      </span>
                      <span>
                        Capacidad: {course.capacity}
                      </span>
                      <span>
                        {percentage}% del total
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex-shrink-0 w-24">
                  <div className="text-right text-sm font-medium text-gray-900 mb-1">
                    {course.popularity}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        position === 1 ? 'bg-yellow-500' :
                        position === 2 ? 'bg-gray-400' :
                        position === 3 ? 'bg-amber-600' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(course.popularity, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Additional info for top 3 */}
              {position <= 3 && (
                <div className="mt-3 pl-10">
                  <div className="text-xs text-gray-500 bg-white rounded-md px-3 py-1 inline-block">
                    {position === 1 && "🏆 ¡El más popular!"}
                    {position === 2 && "🥈 Segundo lugar"}
                    {position === 3 && "🥉 Tercer lugar"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 text-center">
        <p className="text-xs text-gray-500">
          Actualizado en tiempo real • Última actualización: {new Date().toLocaleString('es-ES')}
        </p>
      </div>
    </div>
  );
};

export default Top10Courses;
