"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { usePacientes } from "@/lib/hooks";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SesionesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: pacientes, isLoading } = usePacientes({ search: search || undefined, orderBy: "apellido" });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Sesiones</h1>
      <p className="text-sm text-muted-foreground -mt-3">
        Seleccioná un paciente para ver y registrar sus sesiones.
      </p>

      <div className="relative">
        <Search size={15} className="absolute left-2.5 top-2.5 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : !pacientes?.length ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No se encontraron pacientes.
        </p>
      ) : (
        <div className="space-y-2">
          {pacientes.map((p) => (
            <Card
              key={p.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/pacientes/${p.id}?tab=sesiones`)}
            >
              <CardContent className="flex items-center justify-between py-3 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-700 font-semibold text-xs">
                      {p.apellido[0]}{p.nombre[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {p.apellido}, {p.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">DNI {p.dni}</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={p.activo ? "bg-emerald-100 text-emerald-800" : ""}
                >
                  {p.activo ? "Activo" : "Inactivo"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
