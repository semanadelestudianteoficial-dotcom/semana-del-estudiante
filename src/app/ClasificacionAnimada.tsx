"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

type Equipo = {
  equipo_id: number;
  nombre: string;
  color_hex: string;
  puntos_totales: number;
};

type ClasificacionGuardada = {
  id: number;
  puntos: number;
}[];

const CLAVE = "clasificacion_animacion_v2";

export default function ClasificacionAnimada({
  equipos,
}: {
  equipos: Equipo[];
}) {
  const [lista, setLista] = useState<Equipo[]>(equipos);

  const [cambios, setCambios] = useState<
    Record<number, "subio" | "bajo">
  >({});

  useEffect(() => {
    const actual: ClasificacionGuardada = equipos.map((equipo) => ({
      id: equipo.equipo_id,
      puntos: equipo.puntos_totales,
    }));

    const versionActual = JSON.stringify(actual);
    const guardada = localStorage.getItem(CLAVE);

    if (!guardada) {
      setLista(equipos);
      localStorage.setItem(CLAVE, versionActual);
      return;
    }

    let anterior: ClasificacionGuardada;

    try {
      anterior = JSON.parse(guardada);
    } catch {
      setLista(equipos);
      localStorage.setItem(CLAVE, versionActual);
      return;
    }

    const ordenAnterior = anterior.map((equipo) => equipo.id);
    const ordenActual = equipos.map((equipo) => equipo.equipo_id);

    const cambioDeOrden =
      JSON.stringify(ordenAnterior) !== JSON.stringify(ordenActual);

    if (!cambioDeOrden) {
      setLista(equipos);
      localStorage.setItem(CLAVE, versionActual);
      setCambios({});
      return;
    }

    const listaAnterior = ordenAnterior
      .map((id) =>
        equipos.find((equipo) => equipo.equipo_id === id)
      )
      .filter(Boolean) as Equipo[];

    const nuevosCambios: Record<number, "subio" | "bajo"> = {};

    equipos.forEach((equipo, posicionNueva) => {
      const posicionAnterior = ordenAnterior.indexOf(
        equipo.equipo_id
      );

      if (posicionAnterior === -1) return;

      if (posicionNueva < posicionAnterior) {
        nuevosCambios[equipo.equipo_id] = "subio";
      }

      if (posicionNueva > posicionAnterior) {
        nuevosCambios[equipo.equipo_id] = "bajo";
      }
    });

    setLista(listaAnterior);
    setCambios(nuevosCambios);

    const moverTimer = setTimeout(() => {
      setLista(equipos);
    }, 700);

    const finalizarTimer = setTimeout(() => {
      localStorage.setItem(CLAVE, versionActual);
      setCambios({});
    }, 2700);

    return () => {
      clearTimeout(moverTimer);
      clearTimeout(finalizarTimer);
    };
  }, [equipos]);

  return (
    <div className="space-y-1.5 md:space-y-3">
      {lista.map((equipo, index) => {
        const cambio = cambios[equipo.equipo_id];

        return (
          <motion.div
            layout
            key={equipo.equipo_id}
            transition={{
              layout: {
                duration: 1.4,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            className="relative overflow-hidden rounded-[1.55rem] border border-white/80 bg-white/55 px-3 py-2.5 md:px-4 md:py-4 shadow-[0_8px_24px_rgba(31,41,55,0.09)] backdrop-blur-xl"
          >
            <div
              className="absolute bottom-0 left-0 top-0 w-1.5"
              style={{
                backgroundColor: equipo.color_hex,
              }}
            />

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2 md:gap-3">
                <div className="flex w-10 shrink-0 items-center gap-1 text-base font-black md:w-12 md:text-lg">
                  <span>
  {lista.findIndex(
    (e) => e.puntos_totales === equipo.puntos_totales
  ) + 1}
  °
</span>

                  {index === 0 &&
  lista.filter(
    (e) => e.puntos_totales === equipo.puntos_totales
  ).length === 1 && (
    <span className="text-sm md:text-base">
      👑
    </span>
  )}
                </div>

                <span
                  className="h-3 w-3 shrink-0 rounded-full shadow-sm md:h-4 md:w-4"
                  style={{
                    backgroundColor: equipo.color_hex,
                  }}
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center">
                    <span className="truncate text-sm font-black md:text-base">
                      {equipo.nombre}
                    </span>

                    {cambio === "subio" && (
                      <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-black text-green-700 md:ml-2 md:px-2 md:py-1 md:text-[10px]">
                        ↑ Subió
                      </span>
                    )}

                    {cambio === "bajo" && (
                      <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-black text-red-600 md:ml-2 md:px-2 md:py-1 md:text-[10px]">
                        ↓ Bajó
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-lg font-black md:text-xl">
                  {equipo.puntos_totales}
                </span>

                <span className="ml-1 text-xs font-bold text-zinc-500">
                  pts
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}