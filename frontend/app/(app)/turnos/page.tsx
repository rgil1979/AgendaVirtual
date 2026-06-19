"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTurnosMes, useDeleteTurno, usePacientes } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TurnoForm } from "@/components/turnos/turno-form";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function TurnosPage() {
  const [current, setCurrent] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  const { data: turnos, isLoading } = useTurnosMes(
    current.getFullYear(),
    current.getMonth() + 1
  );
  const deleteTurno = useDeleteTurno();

  const days = eachDayOfInterval({
    start: startOfMonth(current),
    end: endOfMonth(current),
  });
  const firstDayOffset = getDay(startOfMonth(current));

  function turnosForDay(day: Date) {
    return (turnos ?? [])
      .filter((t) => isSameDay(new Date(t.fecha), day))
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  async function handleDelete(id: string) {
    try {
      await deleteTurno.mutateAsync(id);
      toast.success("Turno eliminado");
    } catch {
      toast.error("Error al eliminar el turno");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Turnos</h1>
        <Button
          className="bg-rose-700 hover:bg-rose-800"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} className="mr-1" /> Nuevo turno
        </Button>
      </div>

      <Tabs defaultValue="calendario">
        <TabsList>
          <TabsTrigger value="calendario">Calendario</TabsTrigger>
          <TabsTrigger value="lista">Lista del mes</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base capitalize">
                {format(current, "MMMM yyyy", { locale: es })}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setCurrent((d) => subMonths(d, 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setCurrent((d) => addMonths(d, 1))}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {DIAS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-gray-500 py-2"
                    >
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {days.map((day) => {
                    const ts = turnosForDay(day);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[80px] rounded-md p-1 border text-xs ${
                          isToday
                            ? "border-rose-400 bg-rose-50"
                            : "border-gray-100 bg-white"
                        }`}
                      >
                        <span
                          className={`font-medium ${
                            isToday ? "text-rose-700" : "text-gray-600"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        <div className="mt-0.5 space-y-0.5">
                          {ts.map((t) => (
                            <div
                              key={t.id}
                              className="group relative bg-rose-100 text-rose-800 rounded px-1 py-0.5 flex items-center gap-1"
                            >
                              <Clock size={9} />
                              <span>{t.hora}</span>
                              <span className="truncate flex-1">
                                {t.paciente?.apellido}
                              </span>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="hidden group-hover:flex absolute right-0.5 top-0.5 bg-red-500 text-white rounded p-0.5"
                              >
                                <Trash2 size={8} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base capitalize">
                  {format(current, "MMMM yyyy", { locale: es })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCurrent((d) => subMonths(d, 1))}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCurrent((d) => addMonths(d, 1))}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : !turnos?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay turnos este mes.
                </p>
              ) : (
                <div className="space-y-1">
                  {turnos
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.fecha).getTime() -
                          new Date(b.fecha).getTime() ||
                        a.hora.localeCompare(b.hora)
                    )
                    .map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50 group"
                      >
                        <span className="text-xs font-mono text-muted-foreground w-24 shrink-0">
                          {format(new Date(t.fecha), "EEE d MMM", { locale: es })}
                        </span>
                        <Badge variant="outline" className="font-mono text-xs shrink-0">
                          {t.hora}
                        </Badge>
                        <span className="text-sm font-medium flex-1">
                          {t.paciente?.apellido}, {t.paciente?.nombre}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo turno</DialogTitle>
          </DialogHeader>
          <TurnoForm
            defaultDate={current}
            onSuccess={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
