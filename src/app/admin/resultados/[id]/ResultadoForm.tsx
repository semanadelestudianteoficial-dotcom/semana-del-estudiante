"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Equipo = {
  id: number;
  nombre: string;
  color_hex: string;
};

type Props = {
  equipos: Equipo[];
  juegoId: number;
  esColecta: boolean;
  puntosPrimero: number;
  puntosSegundo: number;
  puntosTercero: number;
  puntosCuarto: number;
};

export default function ResultadoForm({
  equipos,
  juegoId,
  esColecta,
  puntosPrimero,
  puntosSegundo,
  puntosTercero,
  puntosCuarto,
}: Props) {
  const [posiciones, setPosiciones] = useState<Record<number, number>>({});
  const [kilos, setKilos] = useState<Record<number, number>>({});
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarResultadoExistente() {
      const { data } = await supabase
        .from("resultados")
        .select("equipo_id, posicion, puntos")
        .eq("juego_id", juegoId);

      if (data && data.length > 0) {
        if (esColecta) {
          const kilosGuardados: Record<number, number> = {};

          data.forEach((resultado) => {
            kilosGuardados[resultado.equipo_id] =
              Number(resultado.puntos) || 0;
          });

          setKilos(kilosGuardados);
        } else {
          const posicionesGuardadas: Record<number, number> = {};

          data.forEach((resultado) => {
            posicionesGuardadas[resultado.equipo_id] =
              Number(resultado.posicion);
          });

          setPosiciones(posicionesGuardadas);
        }
      }

      setCargando(false);
    }

    cargarResultadoExistente();
  }, [juegoId, esColecta]);

  function puntosPorPosicion(posicion: number) {
    if (posicion === 1) return puntosPrimero;
    if (posicion === 2) return puntosSegundo;
    if (posicion === 3) return puntosTercero;
    if (posicion === 4) return puntosCuarto;

    return 0;
  }

  function cambiarPosicion(equipoId: number, valor: string) {
    const posicion = Number(valor);

    setPosiciones((actuales) => ({
      ...actuales,
      [equipoId]: posicion,
    }));

    setMensaje("");
  }

  function cambiarKilos(equipoId: number, valor: string) {
    setKilos((actuales) => ({
      ...actuales,
      [equipoId]: valor === "" ? 0 : Number(valor),
    }));

    setMensaje("");
  }

  async function guardarResultado() {
    setMensaje("");

    if (esColecta) {
      const faltanKilos = equipos.some(
        (equipo) =>
          kilos[equipo.id] === undefined ||
          kilos[equipo.id] < 0
      );

      if (faltanKilos) {
        setMensaje("Completá los kilos de todos los equipos.");
        return;
      }

      setGuardando(true);

      const filas = equipos.map((equipo, index) => ({
        juego_id: juegoId,
        equipo_id: equipo.id,
        posicion: index + 1,
        puntos: kilos[equipo.id] ?? 0,
      }));

      const { error } = await supabase
        .from("resultados")
        .upsert(filas, {
          onConflict: "juego_id,equipo_id",
        });

      if (error) {
        setMensaje(`No se pudo guardar: ${error.message}`);
        setGuardando(false);
        return;
      }

      setMensaje("Kilos guardados correctamente.");
      setGuardando(false);
      return;
    }

    const posicionesElegidas = equipos.map(
      (equipo) => posiciones[equipo.id]
    );

    const faltanPosiciones = posicionesElegidas.some(
      (posicion) => !posicion
    );

    if (faltanPosiciones) {
      setMensaje("Asigná una posición a los cuatro equipos.");
      return;
    }

    const posicionesUnicas = new Set(posicionesElegidas);

    if (posicionesUnicas.size !== equipos.length) {
      setMensaje("No puede haber dos equipos en la misma posición.");
      return;
    }

    setGuardando(true);

    const filas = equipos.map((equipo) => {
      const posicion = posiciones[equipo.id];

      return {
        juego_id: juegoId,
        equipo_id: equipo.id,
        posicion,
        puntos: puntosPorPosicion(posicion),
      };
    });

    const { error } = await supabase
      .from("resultados")
      .upsert(filas, {
        onConflict: "juego_id,equipo_id",
      });

    if (error) {
      setMensaje(`No se pudo guardar: ${error.message}`);
      setGuardando(false);
      return;
    }

    setMensaje("Resultado guardado correctamente.");
    setGuardando(false);
  }

  if (cargando) {
    return (
      <p className="text-sm font-semibold text-zinc-500">
        Cargando...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {esColecta && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-600 shadow-sm">
          Cada kilo equivale a 1 punto.
        </div>
      )}

      {equipos.map((equipo) => {
        const posicion = posiciones[equipo.id] ?? 0;

        return (
          <div
            key={equipo.id}
            className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="h-10 w-10 shrink-0 rounded-2xl"
                  style={{
                    backgroundColor: equipo.color_hex,
                  }}
                />

                <div>
                  <p className="text-lg font-black">
                    {equipo.nombre}
                  </p>

                  <p className="text-xs font-semibold text-zinc-400">
                    {esColecta
                      ? "Kilos aportados"
                      : posicion
                      ? `${puntosPorPosicion(posicion)} puntos`
                      : "Seleccionar posición"}
                  </p>
                </div>
              </div>

              {esColecta ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={kilos[equipo.id] ?? ""}
                    onChange={(e) =>
                      cambiarKilos(equipo.id, e.target.value)
                    }
                    placeholder="0"
                    className="w-24 rounded-xl border border-zinc-200 px-3 py-2 text-right text-lg font-black outline-none"
                  />

                  <span className="text-xs font-bold text-zinc-400">
                    KG
                  </span>
                </div>
              ) : (
                <select
                  value={posiciones[equipo.id] ?? ""}
                  onChange={(e) =>
                    cambiarPosicion(equipo.id, e.target.value)
                  }
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-black outline-none"
                >
                  <option value="">Posición</option>
                  <option value="1">
                    1.º — {puntosPrimero} pts
                  </option>
                  <option value="2">
                    2.º — {puntosSegundo} pts
                  </option>
                  <option value="3">
                    3.º — {puntosTercero} pts
                  </option>
                  <option value="4">
                    4.º — {puntosCuarto} pts
                  </option>
                </select>
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={guardarResultado}
        disabled={guardando}
        className="mt-5 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white transition active:scale-[0.99] disabled:opacity-50"
      >
        {guardando
          ? "Guardando..."
          : esColecta
          ? "Guardar kilos"
          : "Guardar resultado"}
      </button>

      {mensaje && (
        <p className="mt-3 rounded-2xl bg-white p-4 text-center text-sm font-semibold text-zinc-600 shadow-sm">
          {mensaje}
        </p>
      )}
    </div>
  );
}