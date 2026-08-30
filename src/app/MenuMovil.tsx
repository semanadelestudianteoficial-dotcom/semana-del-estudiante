"use client";

import { useEffect, useState } from "react";

export default function MenuMovil() {
  const [abierto, setAbierto] = useState(false);
useEffect(() => {
  if (abierto) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [abierto]);
  return (
    <>
      {/* BOTÓN MENÚ */}
      {!abierto && (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white shadow-lg"
        aria-label="Abrir menú"
      >
        <span className="leading-none">☰</span>
      </button>
)}
      {/* FONDO OSCURO */}
      <div
        onClick={() => setAbierto(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          abierto
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* MENÚ LATERAL */}
      <aside
        className={`fixed right-0 top-0 z-50 h-[100dvh] w-[85%] max-w-sm bg-[#f7f7f5] p-5 shadow-2xl transition-transform duration-300 ease-out ${
          abierto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
              Semana del Estudiante
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Menú
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-xl text-white"
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>

        <div className="mt-8 space-y-3">
          <a
            href="/historial"
            onClick={() => setAbierto(false)}
            className="block rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              Resultados
            </p>

            <h3 className="mt-1 text-lg font-black">
              Historial de actividades
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Posiciones, puntos y ganadores.
            </p>
          </a>

          <a
            href="/galeria"
            onClick={() => setAbierto(false)}
            className="block rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
              Galería
            </p>

            <h3 className="mt-1 text-lg font-black">
              Momentos de la semana
            </h3>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Fotos de cada jornada.
            </p>
          </a>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 h-1 w-8 rounded-full bg-green-500" />

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Equipos
              </p>

              <p className="mt-1 text-2xl font-black">
                4
              </p>

              <p className="mt-1 text-[10px] text-zinc-400">
                Verde · Amarillo
                <br />
                Azul · Rojo
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 h-1 w-8 rounded-full bg-blue-500" />

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Edición
              </p>

              <p className="mt-1 text-2xl font-black">
                2026
              </p>

              <p className="mt-1 text-[10px] text-zinc-400">
                Semana del
                <br />
                Estudiante
              </p>
            </div>
          </div>

         <a
  href="/admin"
  onClick={() => setAbierto(false)}
  className="mt-10 flex items-center justify-center gap-2 text-[10px] font-semibold tracking-wide text-zinc-300 transition hover:text-zinc-500"
>
  <span className="text-xs">⚙</span>
  Acceso administrativo
</a>
        </div>
      </aside>
    </>
  );
}