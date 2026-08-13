"use client";

import { useEffect, useState } from "react";

type Equipo = {
  equipo_id: number;
  nombre: string;
  color_hex: string;
  puntos_totales: number;
};

export default function ClasificacionAnimada({
  equipos,
}: {
  equipos: Equipo[];
}) {
  const [offsets, setOffsets] = useState<Record<number, number>>({});
  const [cambios, setCambios] = useState<
    Record<number, "subio" | "bajo">
  >({});
  const [animar, setAnimar] = useState(false);

  useEffect(() => {
    const ordenActual = equipos.map((e) => e.equipo_id);

    const guardado = localStorage.getItem("orden_clasificacion");

    if (!guardado) {
      localStorage.setItem(
        "orden_clasificacion",
        JSON.stringify(ordenActual)
      );
      return;
    }

    let ordenAnterior: number[];

    try {
      ordenAnterior = JSON.parse(guardado);
    } catch {
      localStorage.setItem(
        "orden_clasificacion",
        JSON.stringify(ordenActual)
      );
      return;
    }

    const cambio =
      JSON.stringify(ordenAnterior) !== JSON.stringify(ordenActual);

    if (!cambio) return;

    const nuevosOffsets: Record<number, number> = {};
    const nuevosCambios: Record<number, "subio" | "bajo"> = {};

    equipos.forEach((equipo, posicionNueva) => {
      const posicionAnterior = ordenAnterior.indexOf(
        equipo.equipo_id
      );

      if (posicionAnterior === -1) return;

      const diferencia = posicionAnterior - posicionNueva;

      // Aproximadamente altura de tarjeta + separación
      nuevosOffsets[equipo.equipo_id] = diferencia * 69;

      if (diferencia > 0) {
        nuevosCambios[equipo.equipo_id] = "subio";
      }

      if (diferencia < 0) {
        nuevosCambios[equipo.equipo_id] = "bajo";
      }
    });

    setOffsets(nuevosOffsets);
    setCambios(nuevosCambios);
    setAnimar(false);

    // Damos tiempo real al navegador para dibujar
    // las tarjetas en sus posiciones anteriores.
    const inicio = setTimeout(() => {
      setAnimar(true);
    }, 400);

    const limpiar = setTimeout(() => {
      setCambios({});
      setOffsets({});
    }, 2600);

    localStorage.setItem(
      "orden_clasificacion",
      JSON.stringify(ordenActual)
    );

    return () => {
      clearTimeout(inicio);
      clearTimeout(limpiar);
    };
  }, [equipos]);

  return (
    <div className="space-y-3">
      {equipos.map((equipo, index) => {
        const offset = offsets[equipo.equipo_id] ?? 0;
        const cambio = cambios[equipo.equipo_id];

        return (
          <div
            key={equipo.equipo_id}
            style={{
              transform:
                animar || offset === 0
                  ? "translateY(0px)"
                  : `translateY(${offset}px)`,
              transition:
                "transform 1.3s cubic-bezier(0.22, 1, 0.36, 1)",
              position: "relative",
              zIndex: offset !== 0 ? 10 : 1,
            }}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 font-black">
                {index + 1}°
              </span>

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

            <div>
              <span className="font-black">
                {equipo.puntos_totales}
              </span>

              <span className="ml-1 text-xs font-semibold text-zinc-400">
                pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}