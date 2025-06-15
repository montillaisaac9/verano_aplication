'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    lastName: string;
    idCard: string;
    age: number;
    major: string;
    semester: number;
    coursesCount: number;
    courses: Array<{
      name: string;
      selectedAt: string;
    }>;
  } | null;
}

interface ProfilesResponse {
  profiles: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProfilesManagementPage() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    role: 'ALL',
    search: ''
  });
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchProfiles();
    }
  }, [session, pagination.page, filters]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.role !== 'ALL' && { role: filters.role }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/profiles?${params}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar perfiles');
      }
      
      const data: ProfilesResponse = await response.json();
      setProfiles(data.profiles);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Error al cargar los perfiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchProfiles();
  };

  const handleRoleFilter = (role: string) => {
    setFilters(prev => ({ ...prev, role }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const openProfileModal = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedProfile(null);
    setShowModal(false);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (!session?.user) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Perfiles</h1>
        <p className="text-gray-600">Administrar perfiles de usuarios del sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Filtros de rol */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'ALL', label: 'Todos' },
              { key: 'STUDENT', label: 'Estudiantes' },
              { key: 'PROFESSOR', label: 'Profesores' },
              { key: 'ADMIN', label: 'Administradores' }
            ].map((roleOption) => (
              <button
                key={roleOption.key}
                onClick={() => handleRoleFilter(roleOption.key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filters.role === roleOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {roleOption.label}
              </button>
            ))}
          </div>

          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Tabla de perfiles */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Información
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cursos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {profile.student 
                              ? `${profile.student.name} ${profile.student.lastName}`
                              : profile.email
                            }
                          </div>
                          <div className="text-sm text-gray-500">{profile.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile.role === 'ADMIN' 
                            ? 'bg-red-100 text-red-800'
                            : profile.role === 'PROFESSOR'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.student ? (
                          <div>
                            <div>Cédula: {profile.student.idCard || 'N/A'}</div>
                            <div>Edad: {profile.student.age || 'N/A'}</div>
                            <div>Carrera: {profile.student.major || 'N/A'}</div>
                            <div>Semestre: {profile.student.semester || 'N/A'}</div>
                          </div>
                        ) : (
                          'Sin perfil de estudiante'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.student ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            profile.student.coursesCount === 2 ? 'bg-green-100 text-green-800' :
                            profile.student.coursesCount === 1 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {profile.student.coursesCount} curso(s)
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(profile.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openProfileModal(profile)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                      {' '}a{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}de{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && selectedProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles del Perfil
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Información General</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Email:</span> {selectedProfile.email}</p>
                    <p><span className="font-medium">Rol:</span> {selectedProfile.role}</p>
                    <p><span className="font-medium">Fecha de registro:</span> {new Date(selectedProfile.createdAt).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>

                {selectedProfile.student && (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900">Información del Estudiante</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Nombre:</span> {selectedProfile.student.name} {selectedProfile.student.lastName}</p>
                        <p><span className="font-medium">Cédula:</span> {selectedProfile.student.idCard}</p>
                        <p><span className="font-medium">Edad:</span> {selectedProfile.student.age} años</p>
                        <p><span className="font-medium">Carrera:</span> {selectedProfile.student.major}</p>
                        <p><span className="font-medium">Semestre:</span> {selectedProfile.student.semester}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">Cursos Preseleccionados ({selectedProfile.student.coursesCount})</h4>
                      <div className="mt-2">
                        {selectedProfile.student.courses.length > 0 ? (
                          <div className="space-y-2">
                            {selectedProfile.student.courses.map((course, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <p className="font-medium text-gray-900">{course.name}</p>
                                <p className="text-sm text-gray-600">
                                  Seleccionado: {new Date(course.selectedAt).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No ha preseleccionado cursos</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
