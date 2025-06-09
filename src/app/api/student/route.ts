
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
) {

  const seach = request.nextUrl.searchParams;
  const userId = seach.get("userId")

  if (!userId) {
    return NextResponse.json({ message: 'ID de usuario no proporcionado.' }, { status: 400 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: {
        userId: userId, // Buscar el estudiante cuyo campo 'userId' coincida con el ID del usuario de la sesión
      },
      // Puedes incluir relaciones si necesitas datos adicionales, por ejemplo, el usuario asociado
      // include: {
      //   user: true, // Incluye los datos del usuario asociado al estudiante si lo necesitas
      // }
    });

    if (!student) {
      return NextResponse.json({ message: `No se encontró un estudiante para el ID de usuario: ${userId}.` }, { status: 404 });
    }

    return NextResponse.json(student, { status: 200 });

  } catch (error) {
    console.error('Error al obtener detalles del estudiante:', error);
    // Manejo de errores más robusto podría diferenciar entre errores de BD y otros
    return NextResponse.json(
      { message: 'Error interno del servidor al cargar detalles del estudiante.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Desconectar Prisma después de la operación
  }
}