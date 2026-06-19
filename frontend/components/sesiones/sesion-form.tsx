"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Sesion } from "@/lib/types";
import { useCreateSesion, useUpdateSesion } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  pacienteId: string;
  sesion?: Sesion;
  onSuccess?: () => void;
}

type FormData = {
  fecha: string;
  notas: string;
  asistio: boolean;
  pago: boolean;
  monto: string;
  numeroFactura: string;
};

export function SesionForm({ pacienteId, sesion, onSuccess }: Props) {
  const create = useCreateSesion();
  const update = useUpdateSesion(sesion?.id ?? "");

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } =
    useForm<FormData>({
      defaultValues: sesion
        ? {
            fecha: sesion.fecha.substring(0, 10),
            notas: sesion.notas ?? "",
            asistio: sesion.asistio,
            pago: sesion.pago,
            monto: sesion.monto?.toString() ?? "",
            numeroFactura: sesion.numeroFactura ?? "",
          }
        : {
            fecha: new Date().toISOString().substring(0, 10),
            asistio: true,
            pago: false,
          },
    });

  const asistio = watch("asistio");
  const pago = watch("pago");

  async function onSubmit(data: FormData) {
    const payload = {
      pacienteId,
      fecha: data.fecha,
      notas: data.notas || undefined,
      asistio: data.asistio,
      pago: data.pago,
      monto: data.monto ? parseFloat(data.monto) : undefined,
      numeroFactura: data.numeroFactura || undefined,
    };
    try {
      if (sesion) {
        await update.mutateAsync(payload);
        toast.success("Sesión actualizada");
      } else {
        await create.mutateAsync(payload);
        toast.success("Sesión registrada");
      }
      onSuccess?.();
    } catch {
      toast.error("Error al guardar la sesión");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label>Fecha *</Label>
        <Input type="date" {...register("fecha", { required: true })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="asistio"
            checked={asistio}
            onCheckedChange={(v: boolean | "indeterminate") => setValue("asistio", !!v)}
          />
          <Label htmlFor="asistio">Asistió</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="pago"
            checked={pago}
            onCheckedChange={(v: boolean | "indeterminate") => setValue("pago", !!v)}
          />
          <Label htmlFor="pago">Pagó</Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Monto</Label>
          <Input type="number" step="0.01" min="0" placeholder="0.00" {...register("monto")} />
        </div>
        <div className="space-y-1">
          <Label>N° Factura</Label>
          <Input placeholder="Opcional" {...register("numeroFactura")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Notas</Label>
        <Textarea rows={4} placeholder="Observaciones de la sesión..." {...register("notas")} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-rose-700 hover:bg-rose-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : sesion ? "Guardar cambios" : "Registrar"}
        </Button>
      </div>
    </form>
  );
}
