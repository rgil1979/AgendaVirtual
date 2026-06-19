"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { usePacientes, useCreateTurno, useCreateTurnoRecurrente } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const HORAS = Array.from({ length: 25 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
}).filter((h) => h <= "20:00");

interface Props {
  defaultDate?: Date;
  onSuccess?: () => void;
}

export function TurnoForm({ defaultDate, onSuccess }: Props) {
  const { data: pacientes, isLoading } = usePacientes({ activo: true, orderBy: "apellido" });
  const createTurno = useCreateTurno();
  const createRecurrente = useCreateTurnoRecurrente();

  const hoy = defaultDate ?? new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  const [pacienteId, setPacienteId] = useState("");
  const [fecha, setFecha] = useState(format(hoy, "yyyy-MM-dd"));
  const [hora, setHora] = useState("09:00");
  const [diaDeSemana, setDiaDeSemana] = useState(1);
  const [mes, setMes] = useState(mesActual);
  const [anio, setAnio] = useState(anioActual);
  const [omitirConflictos, setOmitirConflictos] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleSingle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pacienteId) return toast.error("Seleccioná un paciente");
    setLoading(true);
    try {
      await createTurno.mutateAsync({ pacienteId, fecha, hora });
      toast.success("Turno registrado");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Error al registrar el turno");
    } finally {
      setLoading(false);
    }
  }

  async function handleRecurrente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pacienteId) return toast.error("Seleccioná un paciente");
    setLoading(true);
    try {
      await createRecurrente.mutateAsync({
        pacienteId,
        diaDeSemana,
        hora,
        anio,
        mes,
        omitirConflictos,
      });
      toast.success("Turnos recurrentes creados");
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Error al crear turnos recurrentes");
    } finally {
      setLoading(false);
    }
  }

  const pacienteSelect = isLoading ? (
    <Skeleton className="h-9 w-full" />
  ) : (
    <div className="space-y-1">
      <Label>Paciente *</Label>
      <select
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={pacienteId}
        onChange={(e) => setPacienteId(e.target.value)}
        required
      >
        <option value="">Seleccioná un paciente...</option>
        {pacientes?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.apellido}, {p.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  const horaSelect = (
    <div className="space-y-1">
      <Label>Hora *</Label>
      <select
        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={hora}
        onChange={(e) => setHora(e.target.value)}
      >
        {HORAS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Tabs defaultValue="unico">
      <TabsList className="w-full">
        <TabsTrigger value="unico" className="flex-1">
          Turno único
        </TabsTrigger>
        <TabsTrigger value="recurrente" className="flex-1">
          Recurrente (mensual)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="unico">
        <form onSubmit={handleSingle} className="space-y-4 mt-4">
          {pacienteSelect}
          <div className="space-y-1">
            <Label>Fecha *</Label>
            <Input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>
          {horaSelect}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-rose-700 hover:bg-rose-800"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar turno"}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="recurrente">
        <form onSubmit={handleRecurrente} className="space-y-4 mt-4">
          {pacienteSelect}
          <div className="space-y-1">
            <Label>Día de la semana *</Label>
            <select
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={diaDeSemana}
              onChange={(e) => setDiaDeSemana(Number(e.target.value))}
            >
              {DIAS_SEMANA.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {horaSelect}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Mes</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {format(new Date(2024, i, 1), "MMMM", { locale: { code: "es" } as never })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Año</Label>
              <Input
                type="number"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                min={2024}
                max={2030}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="omitir"
              checked={omitirConflictos}
              onCheckedChange={(v: boolean | "indeterminate") => setOmitirConflictos(!!v)}
            />
            <Label htmlFor="omitir" className="text-sm">
              Omitir turnos con conflicto de horario
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-rose-700 hover:bg-rose-800"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear turnos"}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  );
}
