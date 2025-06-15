import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Obtener todas las preselecciones (solo administradores)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario sea administrador
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Construir filtros de búsqueda
    const whereClause = search
      ? {
          OR: [
            {
              student: {
                name: {
                  contains: search,
                  mode: "insensitive" as const
                }
              }
            },
            {
              student: {
                lastName: {
                  contains: search,
                  mode: "insensitive" as const
                }
              }
            },
            {
              student: {
                idCard: {
                  contains: search,
                  mode: "insensitive" as const
                }
              }
            }
          ]
        }
      : {};

    // Obtener preselecciones con paginación
    const [preselections, total] = await Promise.all([
      prisma.courseSelection.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              lastName: true,
              idCard: true,
              age: true,
              major: true,
              semester: true
            }
          },
          selectedCourses: {
            select: {
              id: true,
              name: true,
              capacity: true
            }
          }
        },
        orderBy: {
          selectionDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.courseSelection.count({
        where: whereClause
      })
    ]);

    // Obtener estadísticas generales
    const stats = await prisma.courseSelection.aggregate({
      _count: {
        id: true
      }
    });

    // Obtener estadísticas por curso
    const courseStats = await prisma.course.findMany({
      include: {
        selections: {
          include: {
            _count: {
              select: {
                selectedCourses: true
              }
            }
          }
        }
      }
    });

    // Calcular popularidad de cursos
    const coursePopularity = await prisma.course.findMany({
      include: {
        selections: {
          select: {
            id: true
          }
        }
      }
    });

    const coursesWithStats = coursePopularity.map(course => ({
      id: course.id,
      name: course.name,
      capacity: course.capacity,
      preselections: course.selections.length,
      popularityPercentage: coursePopularity.length > 0 
        ? Math.round((course.selections.length / stats._count.id) * 100) 
        : 0
    })).sort((a, b) => b.preselections - a.preselections);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      preselections,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: {
        totalPreselections: stats._count.id,
        coursesWithStats
      }
    });

  } catch (error) {
    console.error("Error al obtener preselecciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Eliminar una preselección específica (solo administradores)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario sea administrador
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { preselectionId } = body;

    if (!preselectionId) {
      return NextResponse.json(
        { error: "ID de preselección requerido" },
        { status: 400 }
      );
    }

    // Verificar que la preselección existe
    const existingPreselection = await prisma.courseSelection.findUnique({
      where: { id: preselectionId },
      include: {
        student: {
          select: {
            name: true,
            lastName: true
          }
        }
      }
    });

    if (!existingPreselection) {
      return NextResponse.json(
        { error: "Preselección no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la preselección
    await prisma.courseSelection.delete({
      where: { id: preselectionId }
    });

    return NextResponse.json({
      message: `Preselección de ${existingPreselection.student.name} ${existingPreselection.student.lastName} eliminada exitosamente`
    });

  } catch (error) {
    console.error("Error al eliminar preselección:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
