"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminVotacionPage() {
  const [votaciones, setVotaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarVotaciones() {
      const { data, error } = await supabase
        .from("votaciones")
        .select("id, categoria, abierta, fecha_apertura, fecha_cierre")
        .eq("edicion_id", 1)
        .order("id");

      if (error) {
        setMensaje(`Error: ${error.message}`);
        setCargando(false);
        return;
      }

      setVotaciones(data ?? []);
      setCargando(false);
    }

    cargarVotaciones();
  }, []);

  const votacionAbierta =
    votaciones.length > 0 && votaciones.every((votacion) => votacion.abierta);

  async function cambiarEstadoGeneral() {
    setCambiando(true);
    setMensaje("");

    const nuevoEstado = !votacionAbierta;
    const ahora = new Date().toISOString();

    const { error } = await supabase.rpc(
  "cambiar_estado_votacion",
  {
    p_abierta: nuevoEstado,
  }
);

    if (error) {
      setMensaje(`Error: ${error.message}`);
      setCambiando(false);
      return;
    }

    setVotaciones((actuales) =>
      actuales.map((votacion) => ({
        ...votacion,
        abierta: nuevoEstado,
        fecha_apertura: nuevoEstado ? ahora : null,
        fecha_cierre: nuevoEstado ? null : ahora,
      }))
    );

    setMensaje(
      nuevoEstado
        ? "Votación abierta correctamente."
        : "Votación cerrada correctamente."
    );

    setCambiando(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Semana del Estudiante 2026
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Control de votación
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Abrí o cerrá la votación de Miss & Mister.
        </p>

        {cargando && (
          <p className="mt-8 text-sm text-zinc-500">
            Cargando...
          </p>
        )}

        {mensaje && (
          <p className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold shadow-sm">
            {mensaje}
          </p>
        )}

        {!cargando && votaciones.length > 0 && (
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                  Miss & Mister
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Votación general
                </h2>
              </div>

              <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold">
                {votacionAbierta ? "🟢 Abierta" : "🔴 Cerrada"}
              </span>
            </div>

            <button
              type="button"
              onClick={cambiarEstadoGeneral}
              disabled={cambiando}
              className={`mt-6 w-full rounded-2xl px-4 py-4 text-sm font-black text-white disabled:opacity-50 ${
                votacionAbierta
                  ? "bg-red-600"
                  : "bg-zinc-900"
              }`}
            >
              {cambiando
                ? "Guardando..."
                : votacionAbierta
                ? "Cerrar votación"
                : "Abrir votación"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}