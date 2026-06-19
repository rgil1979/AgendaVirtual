import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const username = process.env['SEED_USERNAME'];
  const password = process.env['SEED_PASSWORD'];

  if (!username || !password) {
    throw new Error('SEED_USERNAME and SEED_PASSWORD must be set in environment');
  }

  const existing = await prisma.usuario.findUnique({ where: { username } });
  if (existing) {
    console.log(`Usuario "${username}" ya existe — seed omitido.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.usuario.create({ data: { username, passwordHash } });
  console.log(`Usuario "${username}" creado.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
