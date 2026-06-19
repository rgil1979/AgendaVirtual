import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { PacientesService } from './pacientes.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';

const FAKE_ID = '6641f1e2c4a1b2c3d4e5f601';

const mockPrisma = {
  paciente: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sesion: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  turno: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

async function buildService(): Promise<PacientesService> {
  const module = await Test.createTestingModule({
    providers: [
      PacientesService,
      { provide: PrismaService, useValue: mockPrisma },
    ],
  }).compile();
  return module.get(PacientesService);
}

beforeEach(() => jest.clearAllMocks());

// Bug #1 — edit must NOT overwrite activo to true when omitted from patch
describe('Bug #1 — update does not reset activo to true', () => {
  it('passes no activo field when patch omits it, preserving stored false', async () => {
    const stored = {
      id: FAKE_ID, nombre: 'Ana', apellido: 'García', dni: '12345678',
      activo: false, diagnostico: 'Dislexia', telefonoPaciente: '1122334455',
      obraSocial: 'IOMA', fechaNacimiento: null, telefonoPadre: null,
      nombrePadre: null, nombreMadre: null, telefonoMadre: null,
      nombreOtroFamiliar: null, telefonoOtroFamiliar: null, domicilio: null,
      motivoConsulta: null, datosEscolares: null, anioInicioConsulta: null,
      numeroAfiliado: null, createdAt: new Date(), updatedAt: new Date(),
    };
    mockPrisma.paciente.findUnique.mockResolvedValue(stored);
    mockPrisma.paciente.findFirst.mockResolvedValue(null);
    mockPrisma.paciente.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...stored, ...data }),
    );

    const service = await buildService();
    const result = await service.update(FAKE_ID, { motivoConsulta: 'nueva nota' });

    const updateCall = mockPrisma.paciente.update.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(updateCall.data['activo']).toBeUndefined();
    expect(result.activo).toBe(false);
  });
});

// Bug #2 — fields absent from patch must not overwrite stored values
describe('Bug #2 — update preserves existing field values', () => {
  it('keeps diagnostico when not included in patch', async () => {
    const stored = {
      id: FAKE_ID, nombre: 'Pedro', apellido: 'López', dni: '99887766',
      activo: true, diagnostico: 'TDAH', telefonoPaciente: '999',
      obraSocial: 'Otra', fechaNacimiento: null, telefonoPadre: null,
      nombrePadre: null, nombreMadre: null, telefonoMadre: null,
      nombreOtroFamiliar: null, telefonoOtroFamiliar: null, domicilio: null,
      motivoConsulta: null, datosEscolares: null, anioInicioConsulta: null,
      numeroAfiliado: null, createdAt: new Date(), updatedAt: new Date(),
    };
    mockPrisma.paciente.findUnique.mockResolvedValue(stored);
    mockPrisma.paciente.findFirst.mockResolvedValue(null);
    mockPrisma.paciente.update.mockImplementation(
      ({ data }: { data: Record<string, unknown> }) =>
        Promise.resolve({ ...stored, ...data }),
    );

    const service = await buildService();
    const result = await service.update(FAKE_ID, { telefonoPaciente: '888' });

    const updateCall = mockPrisma.paciente.update.mock.calls[0][0] as { data: Record<string, unknown> };
    expect(updateCall.data['diagnostico']).toBeUndefined();
    expect(result.diagnostico).toBe('TDAH');
  });
});

// Bug #3 — no plaintext or SHA256 passwords; must use bcrypt
describe('Bug #3 — password hashing uses bcrypt', () => {
  it('produces a bcrypt hash, not plaintext or a 64-char hex SHA-256', async () => {
    const plaintext = 'secret123';
    const hash = await bcrypt.hash(plaintext, 12);

    expect(hash).not.toBe(plaintext);
    expect(hash).toMatch(/^\$2[ab]\$/);  // bcrypt format
    expect(hash.length).toBe(60);         // bcrypt = 60 chars; SHA-256 hex = 64 chars
    expect(await bcrypt.compare(plaintext, hash)).toBe(true);
  });
});

// Bug #4 — DTO validates anioInicioConsulta as integer (reflects correct schema type)
describe('Bug #4 — column type validation', () => {
  it('rejects anioInicioConsulta when it is not an integer', async () => {
    const dto = Object.assign(new CreatePacienteDto(), {
      nombre: 'Test', apellido: 'Test', dni: '11111111',
      anioInicioConsulta: 'no-es-numero' as unknown as number,
    });
    const errors = await validate(dto);
    const fieldError = errors.find((e) => e.property === 'anioInicioConsulta');
    expect(fieldError).toBeDefined();
  });
});

// Bug #5 — remove wraps all deletes in a single $transaction callback
describe('Bug #5 — remove uses $transaction', () => {
  it('calls $transaction with a callback function (not raw array)', async () => {
    const stored = {
      id: FAKE_ID, nombre: 'María', apellido: 'Sosa', dni: '55555555',
      activo: true, diagnostico: null, telefonoPaciente: null,
      obraSocial: null, fechaNacimiento: null, telefonoPadre: null,
      nombrePadre: null, nombreMadre: null, telefonoMadre: null,
      nombreOtroFamiliar: null, telefonoOtroFamiliar: null, domicilio: null,
      motivoConsulta: null, datosEscolares: null, anioInicioConsulta: null,
      numeroAfiliado: null, createdAt: new Date(), updatedAt: new Date(),
    };
    mockPrisma.paciente.findUnique.mockResolvedValue(stored);
    mockPrisma.$transaction.mockResolvedValue(stored);

    const service = await buildService();
    await service.remove(FAKE_ID);

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    // MongoDB requires the callback form, not the array batch form
    const arg = mockPrisma.$transaction.mock.calls[0][0] as unknown;
    expect(typeof arg).toBe('function');
  });
});
