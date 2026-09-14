"use client";

import Image from "next/image";
import { useState } from "react";

export default function MenuMovil() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* BOTÓN MENÚ */}
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="fixed bottom-6 left-1/2 z-40 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white shadow-lg"
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
        className={`fixed right-0 top-0 z-50 h-[100dvh] w-[85%] max-w-sm overflow-y-auto bg-[#f7f7f5] p-5 shadow-2xl transition-transform duration-300 ease-out ${
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
          {/* HISTORIAL */}
          <a
            href="/historial"
            onClick={() => setAbierto(false)}
            className="block rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm transition active:scale-[0.99]"
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

          {/* GALERÍA */}
          <a
            href="/galeria"
            onClick={() => setAbierto(false)}
            className="block rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-sm transition active:scale-[0.99]"
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

          {/* INSTALAR APP */}
          <a
            href="/instalar"
            onClick={() => setAbierto(false)}
            className="block rounded-[1.5rem] bg-zinc-950 p-5 text-white shadow-lg transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl">
                📲
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Acceso rápido
                </p>

                <h3 className="mt-1 text-lg font-black">
                  Instalar la app
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-400">
                  Agregala a tu celular.
                </p>
              </div>
            </div>
          </a>

          {/* DATOS */}
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

          {/* FIRMA MOR CREATIVE */}
          <div className="mt-8 rounded-[1.5rem] border border-zinc-200 bg-zinc-950 p-5 text-center text-white shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-black">
              <Image
                src="/mor-creative.jpg"
                alt="MOR. CREATIVE"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            </div>

            <p className="mt-4 text-[9px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Diseño y desarrollo
            </p>

            <p className="mt-1 text-sm font-black text-white">
              Morán Facundo
            </p>

            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.12em] text-zinc-400">
              MOR. CREATIVE
            </p>
          </div>

          {/* ADMIN */}
          <a
            href="/admin"
            onClick={() => setAbierto(false)}
            className="mt-6 flex items-center justify-center gap-2 pb-4 text-[10px] font-semibold tracking-wide text-zinc-300 transition hover:text-zinc-500"
          >
            <span className="text-xs">⚙</span>
            Acceso administrativo
          </a>
        </div>
      </aside>
    </>
  );
}