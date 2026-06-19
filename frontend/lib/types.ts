export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento?: string;
  telefonoPaciente?: string;
  nombrePadre?: string;
  telefonoPadre?: string;
  nombreMadre?: string;
  telefonoMadre?: string;
  nombreOtroFamiliar?: string;
  telefonoOtroFamiliar?: string;
  domicilio?: string;
  motivoConsulta?: string;
  datosEscolares?: string;
  anioInicioConsulta?: number;
  obraSocial?: string;
  numeroAfiliado?: string;
  diagnostico?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  sesiones?: Sesion[];
  turnos?: Turno[];
}

export interface PacienteStats {
  totalSesiones: number;
  sesionesAsistidas: number;
  sesionesPagadas: number;
  deudaTotal: number;
  montoTotal: number;
  ultimaSesion?: string;
}

export interface Sesion {
  id: string;
  pacienteId: string;
  fecha: string;
  notas?: string;
  asistio: boolean;
  pago: boolean;
  monto?: number;
  numeroFactura?: string;
  createdAt: string;
  updatedAt: string;
  paciente?: Paciente;
}

export interface Turno {
  id: string;
  pacienteId: string;
  fecha: string;
  hora: string;
  createdAt: string;
  updatedAt: string;
  paciente?: Paciente;
}

export interface PacienteFilters {
  search?: string;
  anioInicio?: number;
  activo?: boolean;
  orderBy?: "apellido" | "nombre" | "fechaNacimiento" | "anioInicioConsulta";
}

export interface SesionFilters {
  desde?: string;
  hasta?: string;
  estadoPago?: "todos" | "pagados" | "pendientes";
}
