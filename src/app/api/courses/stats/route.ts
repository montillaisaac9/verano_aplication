import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener cursos con conteo de selecciones (votos)
    const coursesWithStats = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        capacity: true,
        createdAt: true,
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
      }
    });

    // Formatear los datos para incluir el conteo de votos
    const formattedStats = coursesWithStats.map(course => ({
      id: course.id,
      name: course.name,
      capacity: course.capacity,
      votes: course._count.selections,
      createdAt: course.createdAt,
      popularity: course._count.selections > 0 ? 
        Math.round((course._count.selections / Math.max(1, course.capacity)) * 100) : 0
    }));

    // Top 10 cursos más votados
    const top10 = formattedStats.slice(0, 10);

    // Estadísticas generales
    const totalCourses = coursesWithStats.length;
    const totalVotes = formattedStats.reduce((sum, course) => sum + course.votes, 0);
    const averageVotes = totalCourses > 0 ? Math.round(totalVotes / totalCourses) : 0;

    return NextResponse.json({
      top10,
      allCourses: formattedStats,
      stats: {
        totalCourses,
        totalVotes,
        averageVotes,
        mostPopular: formattedStats[0] || null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error al obtener estadísticas de cursos:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al cargar estadísticas.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
