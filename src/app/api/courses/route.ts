
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
) {
;
  try {
    const courses = await prisma.course.findMany({
        where: {
        },
        select: {
            id: true,
            name: true
        }
    }
);
    return NextResponse.json(courses, { status: 200 });

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