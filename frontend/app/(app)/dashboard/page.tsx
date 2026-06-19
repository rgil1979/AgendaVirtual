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
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTurnosMes } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DashboardPage() {
  const [current, setCurrent] = useState(new Date());
  const { data: turnos, isLoading } = useTurnosMes(
    current.getFullYear(),
    current.getMonth() + 1
  );

  const days = eachDayOfInterval({
    start: startOfMonth(current),
    end: endOfMonth(current),
  });

  const firstDayOffset = getDay(startOfMonth(current));

  function turnosForDay(day: Date) {
    return (turnos ?? []).filter((t) => isSameDay(new Date(t.fecha), day));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Bienvenida, Mariel 👋
      </h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg capitalize">
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
            <Skeleton className="h-64 w-full" />
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
                    className={`min-h-[72px] rounded-md p-1 border text-xs ${
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
                    <div className="mt-1 space-y-0.5">
                      {ts.map((t) => (
                        <div
                          key={t.id}
                          className="bg-rose-100 text-rose-800 rounded px-1 py-0.5 truncate flex items-center gap-1"
                        >
                          <Clock size={10} />
                          <span>{t.hora}</span>
                          <span className="truncate">
                            {t.paciente?.apellido ?? ""}
                          </span>
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

      {/* Turnos del día */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Turnos de hoy —{" "}
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            (() => {
              const hoy = (turnos ?? []).filter((t) =>
                isSameDay(new Date(t.fecha), new Date())
              );
              if (!hoy.length)
                return (
                  <p className="text-sm text-muted-foreground">
                    No hay turnos para hoy.
                  </p>
                );
              return (
                <ul className="divide-y">
                  {hoy
                    .sort((a, b) => a.hora.localeCompare(b.hora))
                    .map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center gap-3 py-2 text-sm"
                      >
                        <Badge variant="outline" className="font-mono">
                          {t.hora}
                        </Badge>
                        <span className="font-medium">
                          {t.paciente?.apellido}, {t.paciente?.nombre}
                        </span>
                      </li>
                    ))}
                </ul>
              );
            })()
          )}
        </CardContent>
      </Card>
    </div>
  );
}
