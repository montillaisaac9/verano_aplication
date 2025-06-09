'use client';

import React from 'react';
import { Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // Importa toast

import { loginSchema, LoginFormData } from '@/types/formSchemas';
import { CircularProgress } from '@/components/progres';

// Componente simple de CircularProgress (puedes estilizarlo más con Tailwind)

const LoginPage: React.FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await toast.promise(
        signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.password,
        }),
        {
          loading: 'Iniciando sesión...', // Mensaje mientras carga
          success: '¡Inicio de sesión exitoso!', // Mensaje al éxito
          error: (err) => {
            // 'err' aquí es el objeto 'AuthError' o 'Error' que NextAuth.js propaga
            // Si el error es una cadena, la usamos directamente, si no, un mensaje genérico.
            return err instanceof Error ? err.message : 'Error al iniciar sesión.';
          },
        }
      );

      if (result?.error) {
        // toast.error ya se maneja en el callback 'error' de toast.promise
        console.error('Error de autenticación:', result.error);
      } else if (result?.ok) {
        router.push('/dashboard');
        reset();
      }
    } catch (error) {
      console.error('Error inesperado durante el inicio de sesión:', error);
      toast.error('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><defs><linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%23b3d9ff;stop-opacity:1" /><stop offset="100%" style="stop-color:%234a90e2;stop-opacity:1" /></linearGradient></defs><rect width="1000" height="600" fill="url(%23sky)"/><path d="M0,400 Q250,350 500,380 T1000,360 L1000,600 L0,600 Z" fill="%23667eea" opacity="0.7"/><path d="M0,450 Q200,400 400,420 T800,400 Q900,405 1000,410 L1000,600 L0,600 Z" fill="%23764ba2" opacity="0.6"/><circle cx="150" cy="200" r="30" fill="white" opacity="0.8"/><circle cx="200" cy="180" r="20" fill="white" opacity="0.6"/><circle cx="300" cy="220" r="25" fill="white" opacity="0.7"/></svg>')`
        }}
      />

      {/* Login Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full mx-4">
        <div className="flex min-h-96">
          {/* Left side - Mountain Image */}
          <div className="hidden md:flex md:w-1/2 relative">
            <div
              className="w-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="mountain-sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%23a8d8f0;stop-opacity:1" /><stop offset="70%" style="stop-color:%236bb6d6;stop-opacity:1" /><stop offset="100%" style="stop-color:%232e86ab;stop-opacity:1" /></linearGradient><linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%236b8db5;stop-opacity:1" /><stop offset="100%" style="stop-color:%233d5a7a;stop-opacity:1" /></linearGradient><linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:%23547a96;stop-opacity:1" /><stop offset="100%" style="stop-color:%23334963;stop-opacity:1" /></linearGradient></defs><rect width="400" height="500" fill="url(%23mountain-sky)"/><path d="M0,300 L50,200 L120,250 L200,150 L280,200 L350,120 L400,180 L400,500 L0,500 Z" fill="url(%23mountain1)" opacity="0.9"/><path d="M0,350 L80,280 L150,320 L250,220 L320,260 L400,200 L400,500 L0,500 Z" fill="url(%23mountain2)" opacity="0.8"/><path d="M0,400 L100,350 L180,380 L280,320 L400,340 L400,500 L0,500 Z" fill="%232c4155" opacity="0.7"/><ellipse cx="120" cy="250" rx="25" ry="8" fill="white" opacity="0.9"/><ellipse cx="180" cy="200" rx="35" ry="12" fill="white" opacity="0.8"/><ellipse cx="280" cy="300" rx="20" ry="6" fill="white" opacity="0.9"/><ellipse cx="320" cy="230" rx="30" ry="10" fill="white" opacity="0.7"/></svg>')`
              }}
            />
          </div>

          {/* Right side - Login Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
                Login into account
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Email Address"
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
                    type="password"
                    {...register('password')}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 uppercase tracking-wide"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress /> : 'Login'}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
                <a href="/auth/register" className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors duration-200">
                  Register here
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;