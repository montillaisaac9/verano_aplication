import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Obtener todos los cursos con estadísticas para admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      );
    }

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        capacity: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            selections: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedCourses = courses.map(course => ({
      ...course,
      votes: course._count.selections,
      availableSpots: course.capacity - course._count.selections
    }));

    return NextResponse.json(formattedCourses, { status: 200 });

  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Crear nuevo curso
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      );
    }

    const { name, capacity } = await request.json();

    if (!name || !capacity || capacity < 1) {
      return NextResponse.json(
        { message: 'Nombre y capacidad son requeridos. La capacidad debe ser mayor a 0.' },
        { status: 400 }
      );
    }

    // Verificar si el curso ya existe
    const existingCourse = await prisma.course.findUnique({
      where: { name }
    });

    if (existingCourse) {
      return NextResponse.json(
        { message: 'Ya existe un curso con ese nombre.' },
        { status: 409 }
      );
    }

    const newCourse = await prisma.course.create({
      data: {
        name,
        capacity: parseInt(capacity)
      }
    });

    return NextResponse.json(newCourse, { status: 201 });

  } catch (error) {
    console.error('Error al crear curso:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
