import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Obtener estadísticas de votación (solo para administradores)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 });
    }

    // Obtener estadísticas generales
    const totalVotes = await prisma.vote.count();
    const totalStudents = await prisma.student.count();
    const participationRate = totalStudents > 0 ? (totalVotes / totalStudents) * 100 : 0;

    // Obtener votos por categoría
    const votesByCategory = await prisma.vote.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    // Obtener distribución de votos por opción en cada categoría
    const voteDistribution = await prisma.vote.groupBy({
      by: ['category', 'option'],
      _count: {
        id: true
      },
      orderBy: [
        { category: 'asc' },
        { _count: { id: 'desc' } }
      ]
    });

    // Obtener votos recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentVotes = await prisma.vote.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      include: {
        student: {
          select: {
            name: true,
            lastName: true,
            major: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Obtener comentarios (sin información personal)
    const commentsWithVotes = await prisma.vote.findMany({
      where: {
        comment: {
          not: null
        }
      },
      select: {
        category: true,
        option: true,
        comment: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Procesar datos para mejor presentación
    const categoryStats = votesByCategory.map(category => {
      const categoryDistribution = voteDistribution.filter(vote => vote.category === category.category);
      const totalCategoryVotes = categoryDistribution.reduce((sum, vote) => sum + vote._count.id, 0);
      
      return {
        category: category.category,
        totalVotes: category._count.id,
        options: categoryDistribution.map(vote => ({
          option: vote.option,
          count: vote._count.id,
          percentage: totalCategoryVotes > 0 ? ((vote._count.id / totalCategoryVotes) * 100).toFixed(1) : '0'
        }))
      };
    });

    // Calcular tendencias por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyVotes = await prisma.vote.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true
      }
    });

    // Agrupar votos por día
    const votesByDay = dailyVotes.reduce((acc, vote) => {
      const day = vote.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const votingTrend = Object.entries(votesByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        totalVotes,
        totalStudents,
        participationRate: Math.round(participationRate * 100) / 100,
        categoriesCount: votesByCategory.length
      },
      categoryStats,
      recentVotes: recentVotes.map(vote => ({
        id: vote.id,
        category: vote.category,
        option: vote.option,
        studentName: `${vote.student.name} ${vote.student.lastName}`,
        studentMajor: vote.student.major,
        createdAt: vote.createdAt,
        hasComment: !!vote.comment
      })),
      comments: commentsWithVotes,
      votingTrend
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de votación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminar todos los votos (solo para administradores, usar con precaución)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores.' }, { status: 403 });
    }

    // Eliminar todos los votos (usar con precaución)
    const deletedVotes = await prisma.vote.deleteMany({});

    return NextResponse.json({
      message: 'Todos los votos han sido eliminados',
      deletedCount: deletedVotes.count
    });

  } catch (error) {
    console.error('Error al eliminar votos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
