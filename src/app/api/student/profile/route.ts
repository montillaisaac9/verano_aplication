import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Obtener perfil del estudiante
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar el perfil del estudiante
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            student: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        selections: {
          include: {
            selectedCourses: {
              select: {
                id: true,
                name: true,
                capacity: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Perfil de estudiante no encontrado' }, { status: 404 });
    }

    // Formatear datos del perfil
    const profile = {
      id: student.id,
      name: student.user.student?.name,
      lastName: student.user.student?.lastName,
      idCard: student.user.student?.idCard,
      age: student.user.student?.age,
      major: student.user.student?.major,
      semester: student.user.student?.semester,
      email: student.user.email,
      role: student.user.role,
      registeredAt: student.user.createdAt,
      coursesCount: student.selections.reduce((total, selection) => total + selection.selectedCourses.length, 0),
      courses: student.selections.flatMap(selection => 
        selection.selectedCourses.map(course => ({
          id: course.id,
          name: course.name,
          capacity: course.capacity,
          selectedAt: selection.selectionDate
        }))
      )
    };

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Actualizar perfil del estudiante
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, lastName, age, major, semester } = body;

    // Validar que el estudiante existe
    const existingStudent = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!existingStudent) {
      return NextResponse.json({ error: 'Perfil de estudiante no encontrado' }, { status: 404 });
    }

    // Actualizar perfil del estudiante
    const updatedStudent = await prisma.student.update({
      where: { userId: session.user.id },
      data: {
        name: name || existingStudent.name,
        lastName: lastName || existingStudent.lastName,
        age: age !== undefined ? age : existingStudent.age,
        major: major || existingStudent.major,
        semester: semester !== undefined ? semester : existingStudent.semester
      },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Perfil actualizado exitosamente',
      profile: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        lastName: updatedStudent.lastName,
        idCard: updatedStudent.idCard,
        age: updatedStudent.age,
        major: updatedStudent.major,
        semester: updatedStudent.semester,
        email: updatedStudent.user.email,
        role: updatedStudent.user.role
      }
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
