import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Obtener todos los perfiles de usuarios
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (role && role !== 'ALL') {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { 
          student: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    // Obtener usuarios con sus perfiles de estudiante
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            include: {
              selections: {
                include: {
                  selectedCourses: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where })
    ]);

    // Formatear datos
    const profiles = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      student: user.student ? {
        id: user.student.id,
        name: user.student.name,
        lastName: user.student.lastName,
        idCard: user.student.idCard,
        age: user.student.age,
        major: user.student.major,
        semester: user.student.semester,
        coursesCount: user.student.selections.reduce((total, selection) => total + selection.selectedCourses.length, 0),
        courses: user.student.selections.flatMap(selection => 
          selection.selectedCourses.map(course => ({
            name: course.name,
            selectedAt: selection.selectionDate
          }))
        )
      } : null
    }));

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Crear nuevo usuario (admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, role, studentData } = body;

    // Validar datos requeridos
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, contraseña y rol son requeridos' }, { status: 400 });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    // Hash de la contraseña (deberías usar bcrypt en producción)
    const hashedPassword = password; // Aquí deberías hashear la contraseña

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as UserRole
      }
    });

    // Si es un estudiante, crear el perfil de estudiante
    if (role === UserRole.STUDENT && studentData) {
      await prisma.student.create({
        data: {
          userId: user.id,
          name: studentData.name,
          lastName: studentData.lastName,
          idCard: studentData.idCard,
          age: studentData.age,
          major: studentData.major,
          semester: studentData.semester
        }
      });
    }

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
