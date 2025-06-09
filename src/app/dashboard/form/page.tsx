// src/components/StudentProfileForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod'; // Importa zod
import axios from 'axios'; // Para las peticiones
import { toast } from 'react-hot-toast'; // Para notificaciones
import { useUserStore } from '@/store/userStore'; // Asume que esta es la ruta a tu store

interface SelectOption {
    id: string,
    name: string;
}


// 1. Define el esquema de validación con Zod
const studentFormSchema = z.object({
  // Asume que tu PrismaStudent tiene estos campos o similar
  id: z.string().optional(), // El ID del estudiante, será llenado automáticamente
  userId: z.string().optional(), // El ID del usuario asociado, será llenado automáticamente
  name: z.string().min(1, 'El número de matrícula es requerido.'),
  lastname: z.string().min(1, 'Debe seleccionar una carrera.'), // ID de la carrera seleccionada
  major: z.string().optional().or(z.literal('')), // Opcional, permite string vacío
  semester: z.string().optional().or(z.literal('')), // Opcional, permite string vacío
});

// Define el tipo de datos del formulario basado en el esquema
type StudentFormData = z.infer<typeof studentFormSchema>;

const StudentProfileForm: React.FC = () => {
  const { studentFullDetails, user, setStudentFullDetails } = useUserStore();
  const [careers, setCareers] = useState<SelectOption[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializa react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      // Establece valores por defecto usando los datos del estudiante del store
      id: studentFullDetails?.id || '',
      userId: studentFullDetails?.userId || '',
      name: studentFullDetails?.name || '',
      lastname: studentFullDetails?.lastName || '',
      major: studentFullDetails?.major || '', // Asegúrate de que tu PrismaStudent tiene majorId si la carrera se guarda por ID
      semester: studentFullDetails?.semester || '',

    },
  });

  // Efecto para cargar las carreras al montar el componente
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setIsLoadingCareers(true);
        const response = await axios.get<SelectOption[]>('/api/courses'); // Llama al endpoint de carreras
        setCareers(response.data);
      } catch (error) {
        console.error('Error al cargar las carreras:', error);
        toast.error('Error al cargar la lista de carreras.');
      } finally {
        setIsLoadingCareers(false);
      }
    };

    fetchCareers();
  }, []); // Se ejecuta una sola vez al montar

  // Efecto para restablecer el formulario cuando los detalles del estudiante cambian (por ejemplo, al cargar por primera vez)
  useEffect(() => {
    if (studentFullDetails) {
      reset({
        id: studentFullDetails.id,
        userId: studentFullDetails.userId,
        name: studentFullDetails.name,
        lastname: studentFullDetails.lastName,
        major: studentFullDetails.major,
        semester: studentFullDetails.semester,
      });
    }
  }, [studentFullDetails, reset]); // Se ejecuta cada vez que studentFullDetails cambia

  // Función que se ejecuta al enviar el formulario (si la validación es exitosa)
  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Datos del formulario a enviar:', data);
      // Aquí harías la petición para actualizar los datos del estudiante
      // Ejemplo: await axios.put(`/api/students/${data.id}`, data);
      // Para este ejemplo, solo simulamos el éxito
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula una petición de red
      setStudentFullDetails(data as PrismaStudent); // ¡CUIDADO! Esto es una actualización optimista. En un caso real, la API debería devolver el objeto actualizado.

      toast.success('Perfil de estudiante actualizado con éxito.');
    } catch (error) {
      console.error('Error al actualizar el perfil del estudiante:', error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || 'Error al actualizar el perfil.');
      } else {
        toast.error('Error inesperado al actualizar el perfil.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentFullDetails && !isLoadingCareers) {
    // Si no hay detalles de estudiante (y no estamos cargando carreras, para evitar parpadeos)
    // y el usuario es un estudiante (se asume que este formulario solo es para estudiantes),
    // podrías mostrar un mensaje o un formulario para crear el perfil si no existe.
    return (
      <div className="flex items-center justify-center p-8 text-center text-gray-600">
        <p>No se encontraron detalles de estudiante. Por favor, asegúrate de que tu perfil de estudiante esté creado.</p>
      </div>
    );
  }

  // Si estamos cargando o no hay detalles del estudiante aún
  if (isLoadingCareers || !studentFullDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
        <p className="ml-3 text-gray-700">Cargando perfil y carreras...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Mi Perfil de Estudiante</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo de Matrícula */}
        <div>
          <label htmlFor="enrollmentNumber" className="block text-sm font-medium text-gray-700">Número de Matrícula</label>
          <input
            id="enrollmentNumber"
            type="text"
            {...register('enrollmentNumber')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          {errors.enrollmentNumber && <p className="mt-1 text-sm text-red-600">{errors.enrollmentNumber.message}</p>}
        </div>

        {/* Campo de Carrera */}
        <div>
          <label htmlFor="majorId" className="block text-sm font-medium text-gray-700">Carrera</label>
          <select
            id="majorId"
            {...register('majorId')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoadingCareers || isSubmitting}
          >
            <option value="">Selecciona una carrera</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name}
              </option>
            ))}
          </select>
          {errors.majorId && <p className="mt-1 text-sm text-red-600">{errors.majorId.message}</p>}
        </div>

        {/* Campo de Año */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">Año de Carrera</label>
          <input
            id="year"
            type="number"
            {...register('year', { valueAsNumber: true })} // Importante para que Zod lo reconozca como número
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
        </div>

        {/* Campo de Teléfono */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono (opcional)</label>
          <input
            id="phone"
            type="text"
            {...register('phone')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
        </div>

        {/* Campo de Dirección */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección (opcional)</label>
          <textarea
            id="address"
            {...register('address')}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          ></textarea>
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
          disabled={isSubmitting || isLoadingCareers}
        >
          {isSubmitting ? 'Guardando...' : 'Actualizar Perfil'}
        </button>
      </form>
    </div>
  );
};

export default StudentProfileForm;