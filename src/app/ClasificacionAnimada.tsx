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

    // Primera visita de este dispositivo:
    // mostramos directamente la clasificación actual.
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

    // Cambiaron puntos pero nadie cambió de puesto.
    if (!cambioDeOrden) {
      setLista(equipos);
      localStorage.setItem(CLAVE, versionActual);
      setCambios({});
      return;
    }

    // Construimos realmente la clasificación anterior.
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

    // Primero queda físicamente en el orden anterior.
    setLista(listaAnterior);
    setCambios(nuevosCambios);

    // Después pasa realmente al orden nuevo.
    const moverTimer = setTimeout(() => {
      setLista(equipos);
    }, 700);

    // IMPORTANTE:
    // recién después de la animación marcamos esta clasificación
    // como "ya vista" por este dispositivo.
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
    <div className="space-y-3">
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
            className={`flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ${
              index === 0 ? "ring-2 ring-zinc-900/10" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex w-12 items-center gap-1 font-black">
                <span>{index + 1}°</span>

                {index === 0 && <span>👑</span>}
              </div>

              <span
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor: equipo.color_hex,
                }}
              />

              <div className="flex items-center">
                <span className="font-bold">
                  {equipo.nombre}
                </span>

                {cambio === "subio" && (
                  <span className="ml-2 text-xs font-bold text-green-600">
                    ↑ subió
                  </span>
                )}

                {cambio === "bajo" && (
                  <span className="ml-2 text-xs font-bold text-red-500">
                    ↓ bajó
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="font-black">
                {equipo.puntos_totales}
              </span>

              <span className="ml-1 text-xs font-semibold text-zinc-400">
                pts
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}