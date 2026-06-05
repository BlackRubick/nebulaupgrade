import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Nebula2024!', 12)

  const cesar = await prisma.user.upsert({
    where: { email: 'cesar@nebula.mx' },
    update: {},
    create: {
      name: 'César',
      email: 'cesar@nebula.mx',
      password,
      role: 'ADMIN',
      isSuperAdmin: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nebula.mx' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@nebula.mx',
      password,
      role: 'ADMIN',
    },
  })

  const vendor = await prisma.user.upsert({
    where: { email: 'vendedor@nebula.mx' },
    update: {},
    create: {
      name: 'Vendedor Demo',
      email: 'vendedor@nebula.mx',
      password,
      role: 'VENDOR',
    },
  })

  await prisma.user.upsert({
    where: { email: 'scanner@nebula.mx' },
    update: {},
    create: {
      name: 'Escáner Demo',
      email: 'scanner@nebula.mx',
      password,
      role: 'SCANNER',
    },
  })

  const event = await prisma.event.create({
    data: {
      name: 'Noche Nebula 2025',
      description: 'El evento del año. Una experiencia única bajo las estrellas con música en vivo, arte y tecnología.',
      date: new Date('2025-12-31T22:00:00'),
      location: 'Estadio Azteca, CDMX',
      capacity: 500,
      status: 'ACTIVE',
      createdById: vendor.id,
    },
  })

  await prisma.ticketPhase.createMany({
    data: [
      {
        eventId: event.id,
        phaseName: 'Preventa',
        ticketPrice: 200,
        order: 1,
        isActive: false,
      },
      {
        eventId: event.id,
        phaseName: 'General',
        ticketPrice: 250,
        order: 2,
        isActive: true,
      },
      {
        eventId: event.id,
        phaseName: 'VIP',
        ticketPrice: 500,
        order: 3,
        isActive: false,
      },
    ],
  })

  console.log('Seed completed!')
  console.log('Users created:')
  console.log('  César (SuperAdmin): cesar@nebula.mx / Nebula2024!')
  console.log('  Admin: admin@nebula.mx / Nebula2024!')
  console.log('  Vendor: vendedor@nebula.mx / Nebula2024!')
  console.log('  Scanner: scanner@nebula.mx / Nebula2024!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
