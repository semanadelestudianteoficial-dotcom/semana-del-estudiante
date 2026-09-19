"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FinalizarSDE({
  finalizadaInicial,
}: {
  finalizadaInicial: boolean;
}) {
  const [finalizada, setFinalizada] = useState(finalizadaInicial);
  const [cargando, setCargando] = useState(false);

  async function cambiarEstado() {
    if (!finalizada) {
      const confirmar = window.confirm(
        "¿Seguro que querés finalizar la Semana del Estudiante 2026? Se mostrará públicamente al equipo campeón."
      );

      if (!confirmar) return;
    } else {
      const confirmar = window.confirm(
        "¿Querés reabrir la Semana del Estudiante 2026?"
      );

      if (!confirmar) return;
    }

    setCargando(true);

    const nuevoEstado = !finalizada;

    const { error } = await supabase
      .from("configuracion_sde")
      .update({
        finalizada: nuevoEstado,
        finalizada_en: nuevoEstado
          ? new Date().toISOString()
          : null,
      })
      .eq("id", 1);

    setCargando(false);

    if (error) {
      console.error("Error al cambiar estado SDE:", error);

      alert(
        "No se pudo cambiar el estado de la Semana del Estudiante."
      );

      return;
    }

    setFinalizada(nuevoEstado);
  }

  return (
    <section
      className={`mb-7 rounded-3xl border p-5 shadow-sm ${
        finalizada
          ? "border-emerald-200 bg-emerald-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">

        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              finalizada
                ? "text-emerald-600"
                : "text-zinc-400"
            }`}
          >
            Cierre SDE 2026
          </p>

          <h2 className="mt-1 text-xl font-black">
            {finalizada
              ? "Semana finalizada 🏆"
              : "Finalizar Semana"}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {finalizada
              ? "La web pública puede mostrar al campeón de la SDE 2026."
              : "Activa la clasificación final y la celebración del campeón."}
          </p>
        </div>

        <div
          className={`mt-2 h-3 w-3 shrink-0 rounded-full ${
            finalizada
              ? "bg-emerald-500"
              : "bg-zinc-300"
          }`}
        />
      </div>

      <button
        type="button"
        onClick={cambiarEstado}
        disabled={cargando}
        className={`mt-5 w-full rounded-2xl px-4 py-4 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
          finalizada
            ? "bg-white text-zinc-900"
            : "bg-zinc-900 text-white"
        }`}
      >
        {cargando
          ? "Guardando..."
          : finalizada
          ? "↩ Reabrir SDE 2026"
          : "🏆 Finalizar SDE 2026"}
      </button>

      {finalizada && (
        <div className="mt-3 rounded-2xl bg-white/70 px-4 py-3">
          <p className="text-center text-xs font-semibold text-emerald-700">
            ✓ Modo final activado
          </p>
        </div>
      )}
    </section>
  );
}