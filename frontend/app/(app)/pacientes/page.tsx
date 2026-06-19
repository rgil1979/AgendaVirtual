"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, UserCheck, UserX } from "lucide-react";
import { usePacientes, useDeletePaciente } from "@/lib/hooks";
import type { PacienteFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PacienteForm } from "@/components/pacientes/paciente-form";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PacientesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PacienteFilters>({
    orderBy: "apellido",
  });
  const [showForm, setShowForm] = useState(false);
  const { data: pacientes, isLoading } = usePacientes(filters);
  const deletePaciente = useDeletePaciente();

  function calcularEdad(fechaNacimiento?: string) {
    if (!fechaNacimiento) return null;
    const diff = Date.now() - new Date(fechaNacimiento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  async function handleDelete(id: string, nombre: string) {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`))
      return;
    try {
      await deletePaciente.mutateAsync(id);
      toast.success("Paciente eliminado");
    } catch {
      toast.error("No se pudo eliminar el paciente");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Pacientes</h1>
        <Button
          className="bg-rose-700 hover:bg-rose-800"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} className="mr-1" /> Nuevo paciente
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-2.5 top-2.5 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por nombre, apellido o DNI..."
            className="pl-8"
            value={filters.search ?? ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value || undefined }))
            }
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={
            filters.activo === undefined
              ? ""
              : filters.activo
              ? "true"
              : "false"
          }
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              activo:
                e.target.value === "" ? undefined : e.target.value === "true",
            }))
          }
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filters.orderBy ?? "apellido"}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              orderBy: e.target.value as PacienteFilters["orderBy"],
            }))
          }
        >
          <option value="apellido">Ordenar por apellido</option>
          <option value="nombre">Ordenar por nombre</option>
          <option value="fechaNacimiento">Ordenar por edad</option>
          <option value="anioInicioConsulta">Ordenar por año inicio</option>
        </select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !pacientes?.length ? (
        <p className="text-muted-foreground text-sm text-center py-12">
          No se encontraron pacientes.
        </p>
      ) : (
        <div className="space-y-2">
          {pacientes.map((p) => {
            const edad = calcularEdad(p.fechaNacimiento);
            return (
              <Card
                key={p.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/pacientes/${p.id}`)}
              >
                <CardContent className="flex items-center justify-between py-4 px-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                      <span className="text-rose-700 font-semibold text-sm">
                        {p.apellido[0]}
                        {p.nombre[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {p.apellido}, {p.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        DNI {p.dni}
                        {edad !== null && ` · ${edad} años`}
                        {p.obraSocial && ` · ${p.obraSocial}`}
                        {p.anioInicioConsulta &&
                          ` · Desde ${p.anioInicioConsulta}`}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Badge
                      variant={p.activo ? "default" : "secondary"}
                      className={
                        p.activo ? "bg-emerald-100 text-emerald-800" : ""
                      }
                    >
                      {p.activo ? (
                        <UserCheck size={12} className="mr-1" />
                      ) : (
                        <UserX size={12} className="mr-1" />
                      )}
                      {p.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/pacientes/${p.id}`)}
                    >
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() =>
                        handleDelete(p.id, `${p.nombre} ${p.apellido}`)
                      }
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog nuevo paciente */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar nuevo paciente</DialogTitle>
          </DialogHeader>
          <PacienteForm onSuccess={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
