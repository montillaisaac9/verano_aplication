import { NextResponse } from 'next/server';
import { studentRegistrationSchema } from '@/types/formSchemas';
import { registerNewStudent } from '@/lib/dataStudent'; // Importa la función de registro
import { ZodError } from 'zod';

// POST /api/students - Registrar un nuevo estudiante
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = studentRegistrationSchema.parse(body);
    const newStudent = await registerNewStudent(validatedData);
    return NextResponse.json(
      { message: 'Estudiante registrado exitosamente.', studentId: newStudent.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: 'Error de validación de datos', errors: error.errors },
        { status: 400 }
      );
    } else if (error instanceof Error) {
      if (error.message.includes('email ya está registrado') || error.message.includes('cédula ya está registrada')) {
        return NextResponse.json(
          { message: error.message },
          { status: 409 } // 409 Conflict
        );
      }
      console.error('Error al registrar estudiante:', error);
      return NextResponse.json(
        { message: 'Error interno del servidor al registrar estudiante.' },
        { status: 500 }
      );
    }
    console.error('Error desconocido al registrar estudiante:', error);
    return NextResponse.json(
      { message: 'Error inesperado al registrar estudiante.' },
      { status: 500 }
    );
  }
}
