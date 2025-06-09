// src/lib/data.ts

import { PrismaClient } from "@prisma/client";// Importa tu instancia de Prisma Client
import { StudentRegistrationFormData } from '@/types/formSchemas'; // Para los tipos de datos de entrada
import { UserRole } from '@prisma/client'; // Importa el enum UserRole directamente de Prisma Client


const prisma = new PrismaClient();

export async function registerNewStudent(data: StudentRegistrationFormData) {
  try {
    // 1. Hashear la contraseña
    // 2. Crear el Usuario y el Estudiante asociado
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: UserRole.STUDENT, // Asigna el rol de estudiante
        student: {
          create: {
            name: data.name,
            lastName: data.lastName,
            idCard: data.idCard,
            age: data.age,
            major: data.major,
            semester: data.semester,
          },
        },
      },
      include: {
        student: true, // Incluir el estudiante recién creado
      },
    });

    if (!newUser.student) {
      throw new Error("No se pudo crear el perfil de estudiante asociado.");
    }

    return newUser.student; // Retorna el objeto estudiante
  } catch (error) {
    console.error("Error al registrar nuevo estudiante en la base de datos:", error);
    // Relanzar el error para que sea capturado por el Route Handler
    throw error;
  }
}

// Función para obtener todos los estudiantes (para el admin)
export async function getAllStudents() {
  try {
    const students = await prisma.student.findMany({
      include: {
        selections: { // Nombre de la relación en el nuevo esquema
          include: {
            selectedCourses: true, // Incluye los cursos seleccionados
          },
        },
        user: {
            select: {
                email: true, // Solo necesitamos el email del usuario asociado
            }
        }
      },
    });
    return students;
  } catch (error) {
    console.error("Error al obtener todos los estudiantes:", error);
    throw error;
  }
}

// Función para obtener un estudiante por su ID
export async function getStudentById(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        selections: {
          include: {
            selectedCourses: true,
          },
        },
        user: {
            select: {
                email: true,
            }
        }
      },
    });
    return student;
  } catch (error) {
    console.error(`Error al obtener estudiante con ID ${studentId}:`, error);
    return null;
  }
}


// Función para obtener todos los cursos disponibles
export async function getAllCourses() {
  try {
    const courses = await prisma.course.findMany();
    return courses;
  } catch (error) {
    console.error("Error al obtener todos los cursos:", error);
    throw error;
  }
}

// Función para obtener conteo de estudiantes por curso (para el admin)
export async function getCourseEnrollmentCounts() {
  try {
    const coursesWithCounts = await prisma.course.findMany({
      include: {
        _count: {
          select: { selections: true }, // Cuenta cuántas CourseSelection tienen este curso
        },
      },
    });

    // Mapea a un formato más legible
    const counts = coursesWithCounts.map(course => ({
      id: course.id,
      name: course.name,
      capacity: course.capacity,
      studentsCount: course._count.selections, // Usa el nombre de la relación 'selections'
    }));

    return counts;
  } catch (error) {
    console.error("Error al obtener conteo de inscripciones por curso:", error);
    throw error;
  }
}

// Función para guardar la selección de cursos de un estudiante
export async function saveCourseSelection(studentId: string, selectedCourseIds: string[]) {
  try {

    await prisma.courseSelection.deleteMany({
      where: { studentId: studentId },
    });

    await prisma.courseSelection.createMany({
      data: selectedCourseIds.map(courseId => ({
        studentId: studentId,
        courseId: courseId,
        selectionDate: new Date(),
      })),
    });

    // Para devolver la selección con detalles (si es necesario), puedes hacer un findMany
    const createdSelections = await prisma.courseSelection.findMany({
      where: { studentId: studentId },
      include: {
        selectedCourses: true, // Incluye los detalles del curso
      }
    });

    return createdSelections;
  } catch (error) {
    console.error("Error al guardar selección de cursos:", error);
    throw error;
  }
}


// Función para obtener las selecciones de cursos de un estudiante específico
export async function getStudentCourseSelection(studentId: string) {
  try {
    const selection = await prisma.courseSelection.findMany({ // Ahora devuelve un array
      where: { studentId: studentId },
      include: {
        selectedCourses: true,
      },
    });
    return selection;
  } catch (error) {
    console.error(`Error al obtener selección de cursos para estudiante ${studentId}:`, error);
    return null;
  }
}

// Función para obtener todas las selecciones de cursos (para el admin)
export async function getAllCourseSelections() {
    try {
        const selections = await prisma.courseSelection.findMany({
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                        idCard: true,
                    }
                },
                selectedCourses: true, // Incluye los detalles del curso
            }
        });
        return selections;
    } catch (error) {
        console.error("Error al obtener todas las selecciones de cursos:", error);
        throw error;
    }
}


// Datos iniciales (solo para poblar la DB una vez en desarrollo si es necesario)
// Considera cómo querrías poblar esto para el desarrollo.
// Podrías crear un script seed.ts en la carpeta prisma/seeds
export async function seedInitialData() {
  try {
    // Solo si no hay cursos, creamos algunos
    const courseCount = await prisma.course.count();
    if (courseCount === 0) {
      await prisma.course.createMany({
        data: [
          { id: "course-1", name: "Introducción a la Programación", capacity: 50 },
          { id: "course-2", name: "Bases de Datos Relacionales", capacity: 40 },
          { id: "course-3", name: "Desarrollo Web Frontend", capacity: 45 },
          { id: "course-4", name: "Algoritmos y Estructuras de Datos", capacity: 35 },
          { id: "course-5", name: "Inteligencia Artificial", capacity: 30 },
        ],
      });
      console.log("Cursos iniciales creados.");
    }


    const studentUser = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
    if (!studentUser) {
      const user = await prisma.user.create({
        data: {
          email: 'student@example.com',
          password: 'password123', // Asegúrate de hashear la contraseña antes de guardarla en producción
          role: UserRole.STUDENT, // Asigna el rol de STUDENT
        },
      });
      await prisma.student.create({
        data: {
          userId: user.id,
          name: 'Ana',
          lastName: 'García',
          idCard: '123456789',
          age: 20,
          major: 'Ingeniería de Sistemas',
          semester: '4',
        }
      });
      console.log("Usuario estudiante de prueba creado.");
    }

  } catch (error) {
    console.error("Error al poblar datos iniciales:", error);
  }
}