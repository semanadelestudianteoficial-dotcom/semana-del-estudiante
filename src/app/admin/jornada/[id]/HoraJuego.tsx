"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  juegoId: number;
  horaInicial: string | null;
};

export default function HoraJuego({
  juegoId,
  horaInicial,
}: Props) {
  const [hora, setHora] = useState(
    horaInicial ? horaInicial.slice(0, 5) : ""
  );

  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function guardarHora() {
    setGuardando(true);
    setGuardado(false);

    const { error } = await supabase
      .from("juegos")
      .update({
        hora: hora || null,
      })
      .eq("id", juegoId);

    setGuardando(false);

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    setGuardado(true);

    setTimeout(() => {
      setGuardado(false);
    }, 1500);
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="time"
        value={hora}
        onChange={(e) => setHora(e.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-zinc-400"
      />

      <button
        type="button"
        onClick={guardarHora}
        disabled={guardando}
        className="rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-black text-zinc-700 transition active:scale-[0.98] disabled:opacity-50"
      >
        {guardando
          ? "..."
          : guardado
          ? "✓"
          : "Guardar"}
      </button>
    </div>
  );
}