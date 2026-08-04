"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Paciente } from "@/lib/types";
import { useCreatePaciente, useUpdatePaciente } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { InputHTMLAttributes } from "react";

const OBRAS_SOCIALES = [
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "IOMA",
  "PAMI",
  "ACCORD",
  "Particular",
  "Otra",
];
const hoy = new Date().toISOString().split("T")[0];


interface Props {
  paciente?: Paciente;
  onSuccess?: () => void;
}

type FormData = Omit<Paciente, "id" | "createdAt" | "updatedAt" | "sesiones" | "turnos">;

export function PacienteForm({ paciente, onSuccess }: Props) {
  const create = useCreatePaciente();
  const update = useUpdatePaciente(paciente?.id ?? "");

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } =
    useForm<FormData>({
      defaultValues: paciente  ? 
      {
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      fechaNacimiento: paciente.fechaNacimiento
        ? paciente.fechaNacimiento.substring(0, 10)
        : undefined,
      telefonoPaciente: paciente.telefonoPaciente,
      nombrePadre: paciente.nombrePadre,
      telefonoPadre: paciente.telefonoPadre,
      nombreMadre: paciente.nombreMadre,
      telefonoMadre: paciente.telefonoMadre,
      nombreOtroFamiliar: paciente.nombreOtroFamiliar,
      telefonoOtroFamiliar: paciente.telefonoOtroFamiliar,
      domicilio: paciente.domicilio,
      motivoConsulta: paciente.motivoConsulta,
      datosEscolares: paciente.datosEscolares,
      anioInicioConsulta: paciente.anioInicioConsulta,
      obraSocial: paciente.obraSocial,
      numeroAfiliado: paciente.numeroAfiliado,
      diagnostico: paciente.diagnostico,
      activo: paciente.activo,
    }
  : {
      activo: true,
      anioInicioConsulta: new Date().getFullYear()
    }
    });

  const activo = watch("activo");

  async function onSubmit(data: FormData) {
    try {
      if (paciente) {
        console.log("DATA ENVIADA:", data);

        await update.mutateAsync(data);
        toast.success("Paciente actualizado");
      } else {
        await create.mutateAsync(data);
        toast.success("Paciente registrado");
      }
      onSuccess?.();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Error al guardar";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }


const field = (
  id: keyof FormData,
  label: string,
  opts: InputHTMLAttributes<HTMLInputElement> & {
    required?: boolean;
  } = {}
) => {
  const { required, type, ...rest } = opts;

  return (
    <div className="space-y-1">
      <Label htmlFor={String(id)}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Input
        id={String(id)}
        type={type ?? "text"}
        {...register(id, { required })}
        {...rest}
      />
    </div>
  );
};

  return (
    
    // <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-6"> // QUITAR EL AUTOCOMPLETAR Para luego. Ahora es util
     <form onSubmit={handleSubmit(onSubmit)}  className="space-y-6">
      <section>
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Datos personales
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {field("nombre", "Nombre ",{ required: true })} 
          {field("apellido", "Apellido ", { required: true })}
          {field("dni", "DNI ", { required: true })}
          {field("fechaNacimiento", "Fecha de nacimiento", { required: true, type: "date", max: hoy })}
          {field("telefonoPaciente", "Teléfono paciente")}
          {field("domicilio", "Domicilio")}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Contactos familiares
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {field("nombrePadre", "Nombre del padre")}
          {field("telefonoPadre", "Teléfono del padre")}
          {field("nombreMadre", "Nombre de la madre")}
          {field("telefonoMadre", "Teléfono de la madre")}
          {field("nombreOtroFamiliar", "Otro familiar")}
          {field("telefonoOtroFamiliar", "Teléfono del otro familiar")}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Información clínica
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Motivo de consulta</Label>
            <Textarea rows={3} {...register("motivoConsulta")} />
          </div>
          <div className="space-y-1">
            <Label>Datos escolares</Label>
            <Textarea rows={2} {...register("datosEscolares")} />
          </div>
          <div className="space-y-1">
            <Label>Diagnóstico</Label>
            <Textarea rows={2} {...register("diagnostico")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field("anioInicioConsulta", "Año de inicio")}
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Obra social
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="obraSocial">Obra social</Label>
            <select
              id="obraSocial"
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              {...register("obraSocial")}
            >
              <option value="">Sin obra social</option>
              {OBRAS_SOCIALES.map((os) => (
                <option key={os} value={os}>
                  {os}
                </option>
              ))}
            </select>
          </div>
          {field("numeroAfiliado", "N° de afiliado")}
        </div>
      </section>

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox
          id="activo"
          checked={activo}
          onCheckedChange={(v: boolean | "indeterminate") => setValue("activo", !!v)}
        />
        <Label htmlFor="activo">Paciente activo</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-rose-700 hover:bg-rose-800"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Guardando..."
            : paciente
            ? "Guardar cambios"
            : "Registrar paciente"}
        </Button>
      </div>
    </form>
  );
}
