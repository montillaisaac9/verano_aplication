'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface ReportData {
  overview?: {
    totalUsers: number;
    totalStudents: number;
    totalCourses: number;
    totalSelections: number;
    averageCoursesPerStudent: number;
    studentsWithoutCourses: number;
    coursesWithoutStudents: number;
  };
  courses?: Array<{
    id: string;
    name: string;
    capacity: number;
    currentEnrollment: number;
    occupancyRate: number;
    availableSpots: number;
    students: Array<{
      name: string;
      idCard: string;
      enrolledAt: string;
    }>;
    createdAt: string;
  }>;
  students?: Array<{
    id: string;
    name: string;
    lastName: string;
    email: string;
    idCard: string;
    age: number;
    major: string;
    semester: number;
    coursesCount: number;
    courses: string[];
    registrationDate: string;
    lastActivity: string;
  }>;
  preselections?: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    studentIdCard: string;
    courses: string[];
    coursesCount: number;
    selectedAt: string;
    createdAt: string;
  }>;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reportData, setReportData] = useState<ReportData>({});
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<string>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate })
      });

      const response = await fetch(`/api/admin/reports?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const result = await response.json();
      setReportData(result.data);
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'overview':
        if (reportData.overview) {
          csvContent = 'Métrica,Valor\n';
          csvContent += `Total de Usuarios,${reportData.overview.totalUsers}\n`;
          csvContent += `Total de Estudiantes,${reportData.overview.totalStudents}\n`;
          csvContent += `Total de Cursos,${reportData.overview.totalCourses}\n`;
          csvContent += `Total de Preselecciones,${reportData.overview.totalSelections}\n`;
          csvContent += `Promedio de Cursos por Estudiante,${reportData.overview.averageCoursesPerStudent}\n`;
          csvContent += `Estudiantes sin Cursos,${reportData.overview.studentsWithoutCourses}\n`;
          csvContent += `Cursos sin Estudiantes,${reportData.overview.coursesWithoutStudents}\n`;
          filename = 'reporte_general.csv';
        }
        break;

      case 'courses':
        if (reportData.courses) {
          csvContent = 'ID,Nombre,Capacidad,Inscripciones,Tasa de Ocupación (%),Espacios Disponibles,Fecha de Creación\n';
          reportData.courses.forEach(course => {
            csvContent += `${course.id},"${course.name}",${course.capacity},${course.currentEnrollment},${course.occupancyRate},${course.availableSpots},"${new Date(course.createdAt).toLocaleDateString()}"\n`;
          });
          filename = 'reporte_cursos.csv';
        }
        break;

      case 'students':
        if (reportData.students) {
          csvContent = 'ID,Nombre,Apellido,Email,Cédula,Edad,Carrera,Semestre,Cursos Preseleccionados,Fecha de Registro\n';
          reportData.students.forEach(student => {
            csvContent += `${student.id},"${student.name}","${student.lastName}","${student.email}","${student.idCard}",${student.age},"${student.major}",${student.semester},${student.coursesCount},"${new Date(student.registrationDate).toLocaleDateString()}"\n`;
          });
          filename = 'reporte_estudiantes.csv';
        }
        break;

      case 'preselections':
        if (reportData.preselections) {
          csvContent = 'ID,Estudiante,Email,Cédula,Cursos Seleccionados,Cantidad de Cursos,Fecha de Preselección\n';
          reportData.preselections.forEach(preselection => {
            csvContent += `${preselection.id},"${preselection.studentName}","${preselection.studentEmail}","${preselection.studentIdCard}","${preselection.courses.join(', ')}",${preselection.coursesCount},"${new Date(preselection.selectedAt).toLocaleDateString()}"\n`;
          });
          filename = 'reporte_preselecciones.csv';
        }
        break;
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast.success('Archivo CSV descargado');
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchReport();
    }
  }, [session, reportType]);

  if (!session?.user) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Reportes Administrativos</h1>
          
          {/* Controles de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Resumen General</option>
                <option value="courses">Cursos</option>
                <option value="students">Estudiantes</option>
                <option value="preselections">Preselecciones</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Generando...' : 'Generar'}
              </button>
              <button
                onClick={exportToCSV}
                disabled={!reportData || Object.keys(reportData).length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Contenido del reporte */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {reportType === 'overview' && reportData.overview && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen General</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800">Total de Usuarios</h3>
                      <p className="text-3xl font-bold text-blue-600">{reportData.overview.totalUsers}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800">Total de Estudiantes</h3>
                      <p className="text-3xl font-bold text-green-600">{reportData.overview.totalStudents}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-800">Total de Cursos</h3>
                      <p className="text-3xl font-bold text-purple-600">{reportData.overview.totalCourses}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-orange-800">Total de Preselecciones</h3>
                      <p className="text-3xl font-bold text-orange-600">{reportData.overview.totalSelections}</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-teal-800">Promedio Cursos/Estudiante</h3>
                      <p className="text-3xl font-bold text-teal-600">{reportData.overview.averageCoursesPerStudent}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-800">Estudiantes sin Cursos</h3>
                      <p className="text-3xl font-bold text-red-600">{reportData.overview.studentsWithoutCourses}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-yellow-800">Cursos sin Estudiantes</h3>
                      <p className="text-3xl font-bold text-yellow-600">{reportData.overview.coursesWithoutStudents}</p>
                    </div>
                  </div>
                </div>
              )}

              {reportType === 'courses' && reportData.courses && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Cursos</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacidad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preselecciones</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ocupación (%)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibles</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.courses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {course.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.capacity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.currentEnrollment}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                course.occupancyRate >= 80 ? 'bg-red-100 text-red-800' :
                                course.occupancyRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {course.occupancyRate}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {course.availableSpots}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(course.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'students' && reportData.students && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Estudiantes</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrera</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semestre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cursos</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.name} {student.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.idCard}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.age}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.major}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.semester}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                student.coursesCount === 2 ? 'bg-green-100 text-green-800' :
                                student.coursesCount === 1 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {student.coursesCount} curso(s)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportType === 'preselections' && reportData.preselections && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Preselecciones</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cursos Seleccionados</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.preselections.map((preselection) => (
                          <tr key={preselection.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {preselection.studentName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {preselection.studentEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {preselection.studentIdCard}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="max-w-xs">
                                {preselection.courses.join(', ')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                preselection.coursesCount === 2 ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {preselection.coursesCount === 2 ? 'Completa' : 'Incompleta'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(preselection.selectedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
