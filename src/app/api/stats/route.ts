import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Estadísticas generales
    const [
      totalUsers,
      totalStudents,
      totalCourses,
      totalSelections,
      usersByRole,
      recentSelections,
      averageAge
    ] = await Promise.all([
      // Total de usuarios
      prisma.user.count(),
      
      // Total de estudiantes
      prisma.student.count(),
      
      // Total de cursos
      prisma.course.count(),
      
      // Total de selecciones
      prisma.courseSelection.count(),
      
      // Usuarios por rol
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      }),
      
      // Selecciones recientes (últimos 7 días)
      prisma.courseSelection.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Edad promedio de estudiantes
      prisma.student.aggregate({
        _avg: {
          age: true
        }
      })
    ]);

    // Cursos más populares (basado en el número de selecciones que los incluyen)
    const popularCourses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        capacity: true,
        _count: {
          select: {
            selections: true
          }
        }
      },
      orderBy: {
        selections: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Estadísticas por mes (últimos 12 meses)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyStats = await prisma.courseSelection.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: twelveMonthsAgo
        }
      }
    });

    // Procesar estadísticas mensuales
    const monthlyData = monthlyStats.reduce((acc: any, selection: any) => {
      const month = new Date(selection.createdAt).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      });
      acc[month] = (acc[month] || 0) + selection._count.id;
      return acc;
    }, {});

    // Estudiantes por semestre
    const studentsBySemester = await prisma.student.groupBy({
      by: ['semester'],
      _count: {
        id: true
      },
      orderBy: {
        semester: 'asc'
      }
    });

    // Estudiantes por carrera (major)
    const studentsByMajor = await prisma.student.groupBy({
      by: ['major'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    const stats = {
      overview: {
        totalUsers,
        totalStudents,
        totalCourses,
        totalSelections,
        recentSelections,
        averageAge: Math.round((averageAge._avg.age || 0) * 10) / 10
      },
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.id
      })),
      popularCourses: popularCourses.map(course => ({
        id: course.id,
        title: course.name,
        capacity: course.capacity,
        selections: course._count.selections
      })),
      monthlySelections: monthlyData,
      studentsBySemester: studentsBySemester.map(item => ({
        semester: item.semester,
        count: item._count.id
      })),
      studentsByMajor: studentsByMajor.map(item => ({
        major: item.major,
        count: item._count.id
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
