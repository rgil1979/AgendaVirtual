"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, User, Phone, School, Heart, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usePaciente, usePacienteStats } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PacienteForm } from "@/components/pacientes/paciente-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SesionesPaciente } from "@/components/sesiones/sesiones-paciente";

function Info({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function PacienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const { data: paciente, isLoading } = usePaciente(id);
  const { data: stats } = usePacienteStats(id);

  function calcularEdad(fechaNacimiento?: string) {
    if (!fechaNacimiento) return null;
    const diff = Date.now() - new Date(fechaNacimiento).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!paciente) return <p>Paciente no encontrado.</p>;

  const edad = calcularEdad(paciente.fechaNacimiento);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            {paciente.apellido}, {paciente.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">DNI {paciente.dni}</p>
        </div>
        <Badge
          variant="secondary"
          className={paciente.activo ? "bg-emerald-100 text-emerald-800" : ""}
        >
          {paciente.activo ? "Activo" : "Inactivo"}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
        >
          <Pencil size={14} className="mr-1" /> Editar
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-rose-700">{stats.totalSesiones}</p>
              <p className="text-xs text-muted-foreground mt-1">Sesiones totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-emerald-600">{stats.sesionesAsistidas}</p>
              <p className="text-xs text-muted-foreground mt-1">Asistidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-blue-600">{stats.sesionesPagadas}</p>
              <p className="text-xs text-muted-foreground mt-1">Pagadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-amber-600">
                ${stats.deudaTotal?.toFixed(2) ?? "0"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Deuda</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User size={15} /> Datos personales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <Info
                label="Fecha de nacimiento"
                value={
                  paciente.fechaNacimiento
                    ? `${format(new Date(paciente.fechaNacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })} (${edad} años)`
                    : undefined
                }
              />
              <Info label="Domicilio" value={paciente.domicilio} />
              <Info label="Teléfono" value={paciente.telefonoPaciente} />
              <Info label="Año inicio" value={paciente.anioInicioConsulta} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone size={15} /> Contactos familiares
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Info label="Padre" value={paciente.nombrePadre} />
              <Info label="Tel. padre" value={paciente.telefonoPadre} />
              <Info label="Madre" value={paciente.nombreMadre} />
              <Info label="Tel. madre" value={paciente.telefonoMadre} />
              <Info label="Otro familiar" value={paciente.nombreOtroFamiliar} />
              <Info label="Tel. otro" value={paciente.telefonoOtroFamiliar} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart size={15} /> Información clínica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Info label="Motivo de consulta" value={paciente.motivoConsulta} />
              <Separator />
              <Info label="Diagnóstico" value={paciente.diagnostico} />
              <Separator />
              <Info label="Datos escolares" value={paciente.datosEscolares} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard size={15} /> Obra social
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Info label="Obra social" value={paciente.obraSocial} />
              <Info label="N° afiliado" value={paciente.numeroAfiliado} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sesiones" className="mt-4">
          <SesionesPaciente pacienteId={id} />
        </TabsContent>
      </Tabs>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar paciente</DialogTitle>
          </DialogHeader>
          <PacienteForm paciente={paciente} onSuccess={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
