// src/types/formSchemas.ts

import { z } from "zod";

// 1. Esquema para el formulario de Registro de Estudiantes
// Este esquema ahora incluye los campos para crear tanto el User como el Student.
export const studentRegistrationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  idCard: z
    .string()
    .min(5, "La cédula debe tener al menos 5 caracteres.")
    .max(15, "La cédula no debe exceder los 15 caracteres."),
  age: z.number().int().min(16, "Debes tener al menos 16 años para registrarte."),
  major: z.string().min(1, "La carrera es requerida."),
  semester: z.string().min(1, "El semestre es requerido."),
  email: z.string().email("Formato de correo electrónico inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

// Tipo inferido del esquema de registro de estudiante
export type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;


// 2. Esquema para el formulario de Selección de Cursos
// Ahora se espera un array de IDs de cursos, y debe contener exactamente 2.
export const courseSelectionSchema = z.object({
  selectedCourseIds: z
    .array(z.string().uuid("ID de curso inválido.")) // Asegura que sean UUIDs si tus IDs de cursos son UUIDs
    .min(2, "Debes seleccionar al menos 2 cursos.")
    .max(2, "Solo puedes seleccionar un máximo de 2 cursos."),
});

// Tipo inferido del esquema de selección de cursos
export type CourseSelectionFormData = z.infer<typeof courseSelectionSchema>;


// 3. Esquema para el formulario de Inicio de Sesión
// No hay cambios aquí, ya que solo requiere email y password.
export const loginSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

// Tipo inferido del esquema de inicio de sesión
export type LoginFormData = z.infer<typeof loginSchema>;