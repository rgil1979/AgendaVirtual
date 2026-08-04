import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type {
  Paciente,
  PacienteFilters,
  PacienteStats,
  Sesion,
  SesionFilters,
  Turno,
} from "./types";

// ── Pacientes ────────────────────────────────────────────────────────────────

export function usePacientes(filters: PacienteFilters = {}) {
  return useQuery({
    queryKey: ["pacientes", filters],
    queryFn: async () => {
      const { data } = await api.get<Paciente[]>("/pacientes", {
        params: filters,
      });
      return data;
    },
  });
}

export function usePaciente(id: string) {
  return useQuery({
    queryKey: ["pacientes", id],
    queryFn: async () => {
      const { data } = await api.get<Paciente>(`/pacientes/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function usePacienteStats(id: string) {
  return useQuery({
    queryKey: ["pacientes", id, "stats"],
    queryFn: async () => {
      const { data } = await api.get<PacienteStats>(`/pacientes/${id}/stats`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreatePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Paciente>) => api.post("/pacientes", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacientes"] }),
  });
}

export function useUpdatePaciente(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Paciente>) => api.patch(`/pacientes/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacientes"] }),
  });
}

export function useDeletePaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/pacientes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pacientes"] }),
  });
}

// ── Sesiones ─────────────────────────────────────────────────────────────────

type SesionesResponse = {
  sesiones: Sesion[];
  deudaPendiente: number;
};

export function useSesiones(pacienteId: string, filters: SesionFilters = {}) {
  return useQuery({
    queryKey: ["sesiones", pacienteId, filters],
    queryFn: async () => {
      const { data } = await api.get<SesionesResponse>(
        `/sesiones/paciente/${pacienteId}`,
        { params: filters }
      );

      return data;
    },
    enabled: !!pacienteId,
  });
}
export function useCreateSesion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Sesion>) => api.post("/sesiones", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sesiones"] }),
  });
}

export function useUpdateSesion(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Sesion>) => api.patch(`/sesiones/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sesiones"] }),
  });
}

export function useDeleteSesion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/sesiones/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sesiones"] }),
  });
}

// ── Turnos ───────────────────────────────────────────────────────────────────

export function useTurnosMes(anio: number, mes: number) {
  return useQuery({
    queryKey: ["turnos", anio, mes],
    queryFn: async () => {
      const { data } = await api.get<Turno[]>("/turnos/mes", {
        params: { anio, mes },
      });
      return data;
    },
  });
}

export function useCreateTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { pacienteId: string; fecha: string; hora: string }) =>
      api.post("/turnos", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turnos"] }),
  });
}

export function useCreateTurnoRecurrente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      pacienteId: string;
      diaDeSemana: number;
      hora: string;
      anio: number;
      mes: number;
      omitirConflictos?: boolean;
    }) => api.post("/turnos/recurrente", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turnos"] }),
  });
}

export function useDeleteTurno() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/turnos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turnos"] }),
  });
}

export function useDeleteTurnosPaciente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pacienteId: string) =>
      api.delete(`/turnos/paciente/${pacienteId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["turnos"] }),
  });
}
