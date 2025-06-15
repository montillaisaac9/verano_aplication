import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Obtener preselección actual del estudiante y cursos disponibles
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario sea estudiante
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { student: true }
    });

    if (!user || user.role !== UserRole.STUDENT || !user.student) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Obtener todos los cursos disponibles
    const courses = await prisma.course.findMany({
      orderBy: { name: 'asc' }
    });

    // Verificar si el estudiante ya tiene una preselección
    const existingSelection = await prisma.courseSelection.findUnique({
      where: { studentId: user.student.id },
      include: {
        selectedCourses: true,
        student: {
          select: {
            name: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      courses,
      hasPreselection: !!existingSelection,
      currentSelection: existingSelection ? {
        id: existingSelection.id,
        selectionDate: existingSelection.selectionDate,
        selectedCourses: existingSelection.selectedCourses,
        student: existingSelection.student
      } : null
    });

  } catch (error) {
    console.error("Error al obtener datos de preselección:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Crear nueva preselección de cursos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario sea estudiante
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { student: true }
    });

    if (!user || user.role !== UserRole.STUDENT || !user.student) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { courseIds } = body;

    // Validar que se seleccionen exactamente 2 cursos
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length !== 2) {
      return NextResponse.json(
        { error: "Debe seleccionar exactamente 2 cursos" },
        { status: 400 }
      );
    }

    // Verificar que los cursos existan
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } }
    });

    if (courses.length !== 2) {
      return NextResponse.json(
        { error: "Uno o más cursos seleccionados no existen" },
        { status: 400 }
      );
    }

    // Verificar que no haya preselección existente
    const existingSelection = await prisma.courseSelection.findUnique({
      where: { studentId: user.student.id }
    });

    if (existingSelection) {
      return NextResponse.json(
        { error: "Ya tienes una preselección registrada" },
        { status: 409 }
      );
    }

    // Crear la preselección
    const newSelection = await prisma.courseSelection.create({
      data: {
        studentId: user.student.id,
        selectedCourses: {
          connect: courseIds.map((id: string) => ({ id }))
        }
      },
      include: {
        selectedCourses: true,
        student: {
          select: {
            name: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Preselección registrada exitosamente",
      selection: newSelection
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear preselección:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Actualizar preselección existente
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario sea estudiante
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { student: true }
    });

    if (!user || user.role !== UserRole.STUDENT || !user.student) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { courseIds } = body;

    // Validar que se seleccionen exactamente 2 cursos
    if (!courseIds || !Array.isArray(courseIds) || courseIds.length !== 2) {
      return NextResponse.json(
        { error: "Debe seleccionar exactamente 2 cursos" },
        { status: 400 }
      );
    }

    // Verificar que los cursos existan
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } }
    });

    if (courses.length !== 2) {
      return NextResponse.json(
        { error: "Uno o más cursos seleccionados no existen" },
        { status: 400 }
      );
    }

    // Verificar que existe una preselección
    const existingSelection = await prisma.courseSelection.findUnique({
      where: { studentId: user.student.id }
    });

    if (!existingSelection) {
      return NextResponse.json(
        { error: "No tienes una preselección para actualizar" },
        { status: 404 }
      );
    }

    // Actualizar la preselección
    const updatedSelection = await prisma.courseSelection.update({
      where: { studentId: user.student.id },
      data: {
        selectedCourses: {
          set: [], // Limpiar selecciones actuales
          connect: courseIds.map((id: string) => ({ id })) // Conectar nuevas selecciones
        },
        updatedAt: new Date()
      },
      include: {
        selectedCourses: true,
        student: {
          select: {
            name: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Preselección actualizada exitosamente",
      selection: updatedSelection
    });

  } catch (error) {
    console.error("Error al actualizar preselección:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
