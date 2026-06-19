"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useSesiones, useCreateSesion, useUpdateSesion, useDeleteSesion } from "@/lib/hooks";
import type { Sesion, SesionFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SesionForm } from "./sesion-form";

interface Props {
  pacienteId: string;
}

export function SesionesPaciente({ pacienteId }: Props) {
  const [filters] = useState<SesionFilters>({ estadoPago: "todos" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sesion | null>(null);
  const { data: sesiones, isLoading } = useSesiones(pacienteId, filters);
  const deleteSesion = useDeleteSesion();

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta sesión?")) return;
    try {
      await deleteSesion.mutateAsync(id);
      toast.success("Sesión eliminada");
    } catch {
      toast.error("No se pudo eliminar la sesión");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          className="bg-rose-700 hover:bg-rose-800"
          onClick={() => setShowForm(true)}
        >
          <Plus size={14} className="mr-1" /> Registrar sesión
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !sesiones?.length ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No hay sesiones registradas.
        </p>
      ) : (
        <div className="space-y-2">
          {sesiones
            .slice()
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-4 p-4 rounded-lg border bg-white"
              >
                <div className="text-center shrink-0 w-14">
                  <p className="text-lg font-bold text-gray-800">
                    {format(new Date(s.fecha), "d")}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {format(new Date(s.fecha), "MMM", { locale: es })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(s.fecha), "yyyy")}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={
                        s.asistio
                          ? "border-emerald-300 text-emerald-700"
                          : "border-red-300 text-red-700"
                      }
                    >
                      {s.asistio ? (
                        <CheckCircle2 size={11} className="mr-1" />
                      ) : (
                        <XCircle size={11} className="mr-1" />
                      )}
                      {s.asistio ? "Asistió" : "Ausente"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        s.pago
                          ? "border-blue-300 text-blue-700"
                          : "border-amber-300 text-amber-700"
                      }
                    >
                      <DollarSign size={11} className="mr-0.5" />
                      {s.pago ? "Pagado" : "Pendiente"}
                    </Badge>
                    {s.monto != null && (
                      <span className="text-sm font-medium text-gray-700">
                        ${s.monto.toFixed(2)}
                      </span>
                    )}
                    {s.numeroFactura && (
                      <span className="text-xs text-muted-foreground">
                        Factura #{s.numeroFactura}
                      </span>
                    )}
                  </div>
                  {s.notas && (
                    <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{s.notas}</p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditing(s)}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar sesión</DialogTitle>
          </DialogHeader>
          <SesionForm pacienteId={pacienteId} onSuccess={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar sesión</DialogTitle>
          </DialogHeader>
          {editing && (
            <SesionForm
              pacienteId={pacienteId}
              sesion={editing}
              onSuccess={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
