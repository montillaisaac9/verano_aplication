import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Obtener votos del estudiante actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar el estudiante
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Perfil de estudiante no encontrado' }, { status: 404 });
    }

    // Obtener todos los votos del estudiante
    const votes = await prisma.vote.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' }
    });

    // Obtener categorías disponibles y verificar cuáles ya han sido votadas
    const availableCategories = [
      { id: 'mejor_curso', name: 'Mejor Curso del Semestre', options: [] },
      { id: 'mejor_profesor', name: 'Mejor Profesor', options: [] },
      { id: 'experiencia_general', name: 'Experiencia General', options: ['Excelente', 'Buena', 'Regular', 'Mala'] }
    ];

    // Obtener cursos para la votación de mejor curso
    const courses = await prisma.course.findMany({
      select: { id: true, name: true }
    });

    availableCategories[0].options = courses.map(course => ({ id: course.id, name: course.name }));

    // Marcar categorías ya votadas
    const votedCategories = votes.map(vote => vote.category);
    const categoriesWithStatus = availableCategories.map(category => ({
      ...category,
      hasVoted: votedCategories.includes(category.id),
      vote: votes.find(vote => vote.category === category.id) || null
    }));

    return NextResponse.json({
      votes,
      categories: categoriesWithStatus
    });

  } catch (error) {
    console.error('Error al obtener votos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Registrar un nuevo voto
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { category, option, comment } = body;

    // Validar datos requeridos
    if (!category || !option) {
      return NextResponse.json({ error: 'Categoría y opción son requeridos' }, { status: 400 });
    }

    // Buscar el estudiante
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Perfil de estudiante no encontrado' }, { status: 404 });
    }

    // Verificar si ya votó en esta categoría
    const existingVote = await prisma.vote.findUnique({
      where: {
        studentId_category: {
          studentId: student.id,
          category: category
        }
      }
    });

    if (existingVote) {
      return NextResponse.json({ 
        error: 'Ya has votado en esta categoría. Solo se permite un voto por categoría.' 
      }, { status: 400 });
    }

    // Crear el voto
    const vote = await prisma.vote.create({
      data: {
        studentId: student.id,
        category,
        option,
        comment: comment || null
      }
    });

    return NextResponse.json({
      message: 'Voto registrado exitosamente',
      vote
    });

  } catch (error) {
    console.error('Error al registrar voto:', error);
    
    // Manejar error de constraint único
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Ya has votado en esta categoría. Solo se permite un voto por categoría.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Actualizar un voto existente (opcional)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { category, option, comment } = body;

    // Validar datos requeridos
    if (!category || !option) {
      return NextResponse.json({ error: 'Categoría y opción son requeridos' }, { status: 400 });
    }

    // Buscar el estudiante
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    });

    if (!student) {
      return NextResponse.json({ error: 'Perfil de estudiante no encontrado' }, { status: 404 });
    }

    // Verificar si existe el voto
    const existingVote = await prisma.vote.findUnique({
      where: {
        studentId_category: {
          studentId: student.id,
          category: category
        }
      }
    });

    if (!existingVote) {
      return NextResponse.json({ 
        error: 'No se encontró un voto previo en esta categoría para actualizar.' 
      }, { status: 404 });
    }

    // Actualizar el voto
    const updatedVote = await prisma.vote.update({
      where: {
        studentId_category: {
          studentId: student.id,
          category: category
        }
      },
      data: {
        option,
        comment: comment || null
      }
    });

    return NextResponse.json({
      message: 'Voto actualizado exitosamente',
      vote: updatedVote
    });

  } catch (error) {
    console.error('Error al actualizar voto:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
