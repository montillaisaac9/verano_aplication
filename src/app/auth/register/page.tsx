'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, CreditCard, Calendar, GraduationCap, BookOpen } from 'lucide-react';
import { studentRegistrationSchema } from '@/types/formSchemas';
import { toast } from 'react-hot-toast'; // Importamos toast
import axios from 'axios'; 

type StudentRegistrationForm = z.infer<typeof studentRegistrationSchema>;

// Componente simple de CircularProgress (puedes estilizarlo más con Tailwind)
const CircularProgress: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const StudentRegistrationPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // isSubmitting se obtiene de useForm
    reset
  } = useForm<StudentRegistrationForm>({
    resolver: zodResolver(studentRegistrationSchema),
  });

  const onSubmit = async (data: StudentRegistrationForm) => {
  try {
    const response = await toast.promise(
      axios.post('/api/students', data),
      {
        loading: 'Registrando estudiante...',
        success: '¡Estudiante registrado exitosamente!',
        error: (err) =>
          err instanceof Error
            ? err.message
            : 'Error al registrar estudiante.',
      }
    );

    // Puedes acceder directamente a response.data si el backend devuelve JSON
    const result = response.data;

    if (!response.status || response.status >= 400) {
      throw new Error(result.message || 'Error desconocido al registrar estudiante.');
    }

    reset(); // Resetea el formulario si todo salió bien
  } catch (error) {
    console.error('Error inesperado durante el registro:', error);
    // El toast ya lo maneja dentro de toast.promise
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-8">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%23b3d9ff;stop-opacity:1" /><stop offset="100%" style="stop-color:%234a90e2;stop-opacity:1" /></linearGradient></defs><rect width="1000" height="600" fill="url(%23sky)"/><path d="M0,400 Q250,350 500,380 T1000,360 L1000,600 L0,600 Z" fill="%23667eea" opacity="0.7"/><path d="M0,450 Q200,400 400,420 T800,400 Q900,405 1000,410 L1000,600 L0,600 Z" fill="%23764ba2" opacity="0.6"/><circle cx="150" cy="200" r="30" fill="white" opacity="0.8"/><circle cx="200" cy="180" r="20" fill="white" opacity="0.6"/><circle cx="300" cy="220" r="25" fill="white" opacity="0.7"/></svg>')`
        }}
      />
      
      {/* Registration Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-6xl w-full mx-4">
        <div className="flex min-h-96">
          {/* Left side - Mountain Image */}
          <div className="hidden lg:flex lg:w-2/5 relative">
            <div 
              className="w-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><linearGradient id="mountain-sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%23a8d8f0;stop-opacity:1" /><stop offset="70%" style="stop-color:%236bb6d6;stop-opacity:1" /><stop offset="100%" style="stop-color:%232e86ab;stop-opacity:1" /></linearGradient><linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%236b8db5;stop-opacity:1" /><stop offset="100%" style="stop-color:%233d5a7a;stop-opacity:1" /></linearGradient><linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%23547a96;stop-opacity:1" /><stop offset="100%" style="stop-color:%23334963;stop-opacity:1" /></linearGradient></defs><rect width="400" height="600" fill="url(%23mountain-sky)"/><path d="M0,350 L50,250 L120,300 L200,200 L280,250 L350,170 L400,230 L400,600 L0,600 Z" fill="url(%23mountain1)" opacity="0.9"/><path d="M0,400 L80,330 L150,370 L250,270 L320,310 L400,250 L400,600 L0,600 Z" fill="url(%23mountain2)" opacity="0.8"/><path d="M0,450 L100,400 L180,430 L280,370 L400,390 L400,600 L0,600 Z" fill="%232c4155" opacity="0.7"/><ellipse cx="120" cy="300" rx="25" ry="8" fill="white" opacity="0.9"/><ellipse cx="180" cy="250" rx="35" ry="12" fill="white" opacity="0.8"/><ellipse cx="280" cy="350" rx="20" ry="6" fill="white" opacity="0.9"/><ellipse cx="320" cy="280" rx="30" ry="10" fill="white" opacity="0.7"/></svg>')`
              }}
            />
          </div>
          
          {/* Right side - Registration Form */}
          <div className="w-full lg:w-3/5 p-8 flex flex-col justify-center">
            <div className="max-w-2xl mx-auto w-full">
              <div className="text-center mb-8">
                <GraduationCap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-3xl font-semibold text-gray-800">
                  Registro de Estudiante
                </h2>
                <p className="text-gray-600 mt-2">Completa tus datos para crear tu cuenta</p>
              </div>
              
              {/* Los mensajes de éxito/error ya no se manejan con estados locales y divs */}
              {/* Ahora los toasts se encargarán de esto. */}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('name')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('lastName')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Apellido"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID Card Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('idCard')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.idCard ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Cédula"
                    />
                    {errors.idCard && (
                      <p className="mt-1 text-sm text-red-600">{errors.idCard.message}</p>
                    )}
                  </div>

                  {/* Age Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('age', { valueAsNumber: true })}
                      type="number"
                      min="16"
                      max="100"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Edad"
                    />
                    {errors.age && (
                      <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                    )}
                  </div>
                </div>

                {/* Academic Information Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Major Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('major')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.major ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Carrera"
                      value={"Ingeniería en Sistemas"} // Valor por defecto
                      disabled={true} // Deshabilita el campo mientras se envía el formulario
                    />
                    {errors.major && (
                      <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>
                    )}
                  </div>

                  {/* Semester Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('semester')}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.semester ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar semestre</option>
                      <option value="1">1er Semestre</option>
                      <option value="2">2do Semestre</option>
                      <option value="3">3er Semestre</option>
                      <option value="4">4to Semestre</option>
                      <option value="5">5to Semestre</option>
                      <option value="6">6to Semestre</option>
                      <option value="7">7mo Semestre</option>
                      <option value="8">8vo Semestre</option>
                      <option value="9">9no Semestre</option>
                      <option value="10">10mo Semestre</option>
                    </select>
                    {errors.semester && (
                      <p className="mt-1 text-sm text-red-600">{errors.semester.message}</p>
                    )}
                  </div>
                </div>

                {/* Account Information Section */}
                {/* Email Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Correo electrónico"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contraseña"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting} // isSubmitting se obtiene de useForm
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors duration-200 uppercase tracking-wide ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isSubmitting ? <CircularProgress /> : 'Registrar Estudiante'}
                </button>
              </form>
              
              {/* Login Link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">¿Ya tienes una cuenta? </span>
                <a href="/auth/login" className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors duration-200">
                  Iniciar sesión
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationPage;