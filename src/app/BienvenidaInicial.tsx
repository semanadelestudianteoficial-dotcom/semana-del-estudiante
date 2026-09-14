"use client";

import { useEffect, useState } from "react";

const CLAVE_BIENVENIDA = "sde_bienvenida_2026_v1";

export default function BienvenidaInicial() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const yaVioBienvenida = localStorage.getItem(CLAVE_BIENVENIDA);

    if (!yaVioBienvenida) {
      setVisible(true);
    }
  }, []);

  function cerrarBienvenida() {
    localStorage.setItem(CLAVE_BIENVENIDA, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/55 px-5 backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/20 bg-white/95 p-6 text-zinc-950 shadow-[0_30px_100px_rgba(0,0,0,0.4)]">
        {/* Luces decorativas */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-green-400/25 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-20 h-52 w-52 rounded-full bg-blue-500/20 blur-[70px]" />

        <div className="relative">
          {/* Logo pequeño */}
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-black text-white shadow-lg">
              SDE
            </div>

            <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
              2026
            </span>
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
            Semana del Estudiante
          </p>

          <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight">
            ¡Bienvenido a la SDE 2026! 👋
          </h2>

          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Desde acá vas a poder seguir la clasificación, las actividades,
            la votación de Miss & Mister, la galería y todo lo que pase
            durante la Semana del Estudiante.
          </p>

          {/* Instalación */}
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📲</span>

              <div>
                <p className="text-sm font-black">
                  También podés instalarla como app
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Abrí el menú <strong>☰</strong> y entrá en{" "}
                  <strong>“Instalar la app”</strong>. Ahí vas a encontrar los
                  pasos para Android y iPhone.
                </p>
              </div>
            </div>
          </div>

          {/* Colores */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            <div className="h-1.5 rounded-full bg-green-500" />
            <div className="h-1.5 rounded-full bg-yellow-400" />
            <div className="h-1.5 rounded-full bg-blue-500" />
            <div className="h-1.5 rounded-full bg-red-500" />
          </div>

          <button
            type="button"
            onClick={cerrarBienvenida}
            className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.98]"
          >
            Entrar a la SDE →
          </button>

          <p className="mt-3 text-center text-[10px] font-semibold text-zinc-400">
            Este mensaje se muestra solamente la primera vez.
          </p>
        </div>
      </div>
    </div>
  );
}