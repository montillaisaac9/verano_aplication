import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const courses = [
  "MATEMÁTICA I",
  "FUNDAMENTOS DE LA INFORMÁTICA",
  "LÓGICA MATEMÁTICA",
  "LENGUAJE Y COMUNICACIÓN",
  "INGLES I",
  "FORMACION CONSTITUCIONAL",
  "ECONOMIA DIGITAL EN VENEZUELA",
  "MATEMÁTICA II",
  "FÍSICA I",
  "ALGORITMOS I",
  "PROBLEMÁTICA CIENTÍFICA Y TECNOLÓGICA",
  "INGLES II",
  "ELECTIVA I",
  "ARTE Y CULTURA",
  "MATEMÁTICA III",
  "FÍSICA II",
  "ALGORITMOS II",
  "PROGRAMACIÓN I",
  "METODOLOGÍA Y TÉCNICAS DE INVESTIGACIÓN",
  "ELECTIVA II",
  "MATEMÁTICA IV",
  "PROBABILIDAD Y ESTADÍSTICA",
  "ESTRUCTURAS DISCRETAS I",
  "PROGRAMACIÓN II",
  "BASE DE DATOS",
  "ELECTIVA III",
  "ORGANIZACIÓN DEL COMPUTADOR",
  "ALGEBRA BOOLEANA",
  "ESTRUCTURAS DISCRETAS II",
  "PROGRAMACIÓN III",
  "TEORÍA DE SISTEMAS",
  "ELECTIVA IV",
  "ARQUITECTURA DEL COMPUTADOR",
  "MÉTODOS NUMÉRICOS",
  "INVESTIGACIÓN DE OPERACIONES",
  "INGENIERÍA ECONÓMICA",
  "SISTEMAS DE INFORMACIÓN I",
  "ELECTIVA V",
  "SISTEMAS OPERATIVOS",
  "CONTROL DE PROYECTOS",
  "ORGANIZACIÓN Y GESTIÓN EMPRESARIAL",
  "TRADUCTORES E INTERPRETES",
  "SISTEMAS DE INFORMACIÓN II",
  "REDES",
  "PASANTÍAS",
  "ELECTIVA DE ÁREA I",
  "LENGUAJES DE PROGRAMACIÓN",
  "SISTEMAS DE INFORMACIÓN III"
]

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Crear usuario admin con contraseña sin hash
  await prisma.user.upsert({
    where: { email: 'glon12@gmail.com' },
    update: {},
    create: {
      email: 'glon12@gmail.com',
      password: '12345678', // ⚠️ texto plano (solo para desarrollo)
      role: 'admin',
    },
  })

  // 2. Insertar cursos
  for (const name of courses) {
    await prisma.course.upsert({
      where: { name },
      update: {},
      create: {
        name,
        capacity: 30,
      },
    })
  }

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
