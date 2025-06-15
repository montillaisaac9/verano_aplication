import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// PUT - Actualizar curso
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      );
    }

    const { name, capacity } = await request.json();
    const courseId = params.id;

    if (!name || !capacity || capacity < 1) {
      return NextResponse.json(
        { message: 'Nombre y capacidad son requeridos. La capacidad debe ser mayor a 0.' },
        { status: 400 }
      );
    }

    // Verificar si el curso existe
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            selections: true
          }
        }
      }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: 'Curso no encontrado.' },
        { status: 404 }
      );
    }

    // Verificar que la nueva capacidad no sea menor que las selecciones actuales
    if (capacity < existingCourse._count.selections) {
      return NextResponse.json(
        { message: `No se puede reducir la capacidad por debajo de ${existingCourse._count.selections} (selecciones actuales).` },
        { status: 400 }
      );
    }

    // Verificar si otro curso ya tiene ese nombre
    if (name !== existingCourse.name) {
      const courseWithSameName = await prisma.course.findUnique({
        where: { name }
      });

      if (courseWithSameName) {
        return NextResponse.json(
          { message: 'Ya existe un curso con ese nombre.' },
          { status: 409 }
        );
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        name,
        capacity: parseInt(capacity)
      }
    });

    return NextResponse.json(updatedCourse, { status: 200 });

  } catch (error) {
    console.error('Error al actualizar curso:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminar curso
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Acceso denegado. Solo administradores.' },
        { status: 403 }
      );
    }

    const courseId = params.id;

    // Verificar si el curso existe y tiene selecciones
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            selections: true
          }
        }
      }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: 'Curso no encontrado.' },
        { status: 404 }
      );
    }

    if (existingCourse._count.selections > 0) {
      return NextResponse.json(
        { message: 'No se puede eliminar un curso que tiene estudiantes inscritos.' },
        { status: 400 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId }
    });

    return NextResponse.json(
      { message: 'Curso eliminado exitosamente.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error al eliminar curso:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
