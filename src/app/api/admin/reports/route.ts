import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    switch (reportType) {
      case 'overview':
        return await generateOverviewReport(dateFilter);
      case 'courses':
        return await generateCoursesReport(dateFilter);
      case 'students':
        return await generateStudentsReport(dateFilter);
      case 'preselections':
        return await generatePreselectionsReport(dateFilter);
      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function generateOverviewReport(dateFilter: any) {
  const [totalUsers, totalStudents, totalCourses, totalSelections] = await Promise.all([
    prisma.user.count({ where: dateFilter }),
    prisma.student.count({ where: dateFilter }),
    prisma.course.count({ where: dateFilter }),
    prisma.courseSelection.count({ where: dateFilter })
  ]);

  // Calcular estudiantes con y sin preselecciones
  const studentsWithSelections = await prisma.student.count({
    where: {
      ...dateFilter,
      selections: {
        some: {}
      }
    }
  });

  const studentsWithoutSelections = totalStudents - studentsWithSelections;

  // Calcular cursos con y sin estudiantes
  const coursesWithStudents = await prisma.course.count({
    where: {
      ...dateFilter,
      selections: {
        some: {}
      }
    }
  });

  const coursesWithoutStudents = totalCourses - coursesWithStudents;

  // Calcular promedio de cursos por estudiante (máximo 2 por preselección)
  const averageCoursesPerStudent = totalStudents > 0 ? (totalSelections * 2) / totalStudents : 0;

  return NextResponse.json({
    type: 'overview',
    data: {
      overview: {
        totalUsers,
        totalStudents,
        totalCourses,
        totalSelections,
        averageCoursesPerStudent: Math.round(averageCoursesPerStudent * 100) / 100,
        studentsWithoutCourses: studentsWithoutSelections,
        coursesWithoutStudents
      }
    }
  });
}

async function generateCoursesReport(dateFilter: any) {
  const courses = await prisma.course.findMany({
    where: dateFilter,
    include: {
      selections: {
        include: {
          student: {
            select: {
              name: true,
              lastName: true,
              idCard: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const coursesData = courses.map(course => ({
    id: course.id,
    name: course.name,
    capacity: course.capacity,
    currentEnrollment: course.selections.length,
    occupancyRate: course.capacity > 0 ? Math.round((course.selections.length / course.capacity) * 100) : 0,
    availableSpots: Math.max(0, course.capacity - course.selections.length),
    students: course.selections.map(selection => ({
      name: `${selection.student.name} ${selection.student.lastName}`,
      idCard: selection.student.idCard,
      enrolledAt: selection.createdAt
    })),
    createdAt: course.createdAt
  }));

  return NextResponse.json({
    type: 'courses',
    data: {
      courses: coursesData,
      summary: {
        totalCourses: courses.length,
        averageOccupancy: coursesData.length > 0 ? Math.round(coursesData.reduce((acc, course) => acc + course.occupancyRate, 0) / coursesData.length) : 0,
        fullCourses: coursesData.filter(course => course.occupancyRate >= 100).length,
        lowOccupancyCourses: coursesData.filter(course => course.occupancyRate < 50).length
      }
    }
  });
}

async function generateStudentsReport(dateFilter: any) {
  const students = await prisma.student.findMany({
    where: dateFilter,
    include: {
      user: {
        select: {
          email: true,
          createdAt: true,
          updatedAt: true
        }
      },
      selections: {
        include: {
          selectedCourses: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const studentsData = students.map(student => ({
    id: student.id,
    name: student.name,
    lastName: student.lastName,
    email: student.user.email,
    idCard: student.idCard,
    age: student.age,
    major: student.major,
    semester: student.semester,
    coursesCount: student.selections.length > 0 ? student.selections[0].selectedCourses.length : 0,
    courses: student.selections.length > 0 ? student.selections[0].selectedCourses.map(course => course.name) : [],
    registrationDate: student.createdAt,
    lastActivity: student.user.updatedAt
  }));

  return NextResponse.json({
    type: 'students',
    data: {
      students: studentsData,
      summary: {
        totalStudents: students.length,
        studentsWithSelections: studentsData.filter(s => s.coursesCount > 0).length,
        studentsWithoutSelections: studentsData.filter(s => s.coursesCount === 0).length,
        averageAge: studentsData.length > 0 ? Math.round(studentsData.reduce((acc, s) => acc + s.age, 0) / studentsData.length) : 0
      }
    }
  });
}

async function generatePreselectionsReport(dateFilter: any) {
  const preselections = await prisma.courseSelection.findMany({
    where: dateFilter,
    include: {
      student: {
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      },
      selectedCourses: {
        select: {
          name: true,
          capacity: true
        }
      }
    },
    orderBy: {
      selectionDate: 'desc'
    }
  });

  const preselectionData = preselections.map(selection => ({
    id: selection.id,
    studentName: `${selection.student.name} ${selection.student.lastName}`,
    studentEmail: selection.student.user.email,
    studentIdCard: selection.student.idCard,
    courses: selection.selectedCourses.map(course => course.name),
    coursesCount: selection.selectedCourses.length,
    selectedAt: selection.selectionDate,
    createdAt: selection.createdAt
  }));

  return NextResponse.json({
    type: 'preselections',
    data: {
      preselections: preselectionData,
      summary: {
        totalPreselections: preselections.length,
        completedPreselections: preselectionData.filter(p => p.coursesCount === 2).length,
        incompletePreselections: preselectionData.filter(p => p.coursesCount < 2).length,
        averageCoursesPerSelection: preselectionData.length > 0 ? Math.round((preselectionData.reduce((acc, p) => acc + p.coursesCount, 0) / preselectionData.length) * 100) / 100 : 0
      }
    }
  });
}
