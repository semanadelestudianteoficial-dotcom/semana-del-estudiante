"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Equipo = {
  id: number;
  nombre: string;
  color_hex: string;
};

export default function ResultadoForm({
  equipos,
  juegoId,
}: {
  equipos: Equipo[];
  juegoId: number;
}) {
  const [puntos, setPuntos] = useState<Record<number, number>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  
  function cambiarPuntos(equipoId: number, valor: string) {
    setPuntos((actuales) => ({
      ...actuales,
      [equipoId]: Number(valor),
    }));
  }
async function guardarResultado() {
  setGuardando(true);
  setMensaje("");

  const filas = equipos.map((equipo, index) => ({
    juego_id: juegoId,
    equipo_id: equipo.id,
    posicion: index + 1,
    puntos: puntos[equipo.id] ?? 0,
  }));

  const { error } = await supabase
    .from("resultados")
    .upsert(filas, {
      onConflict: "juego_id,equipo_id",
    });

  if (error) {
    setMensaje("No se pudo guardar el resultado.");
    setGuardando(false);
    return;
  }

  setMensaje("Resultado guardado correctamente.");
  setGuardando(false);
}
  return (
    <div className="space-y-3">
      {equipos.map((equipo) => (
        <div
          key={equipo.id}
          className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="h-10 w-10 rounded-2xl"
                style={{ backgroundColor: equipo.color_hex }}
              />

              <div>
                <p className="text-lg font-black">
                  {equipo.nombre}
                </p>

                <p className="text-xs font-semibold text-zinc-400">
                  Puntaje obtenido
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={puntos[equipo.id] ?? ""}
                onChange={(e) =>
                  cambiarPuntos(equipo.id, e.target.value)
                }
                placeholder="0"
                className="w-24 rounded-xl border border-zinc-200 px-3 py-2 text-right text-lg font-black outline-none"
              />

              <span className="text-xs font-bold text-zinc-400">
                PTS
              </span>
            </div>
          </div>
        </div>
      ))}

      <button
  type="button"
  onClick={guardarResultado}
  disabled={guardando}
  className="mt-5 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white disabled:opacity-50"
>
  {guardando ? "Guardando..." : "Guardar resultado"}
</button>

{mensaje && (
  <p className="mt-3 text-center text-sm font-semibold text-zinc-500">
    {mensaje}
  </p>
)}
    </div>
  );
}