"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Foto = {
  id: number;
  titulo: string | null;
  descripcion: string | null;
  foto_url: string;
  jornada_id: number | null;
  created_at: string;
};

type Jornada = {
  id: number;
  numero: number;
  nombre: string;
};

export default function GaleriaPage() {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [filtro, setFiltro] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      const [{ data: fotosData }, { data: jornadasData }] =
        await Promise.all([
          supabase
            .from("galeria")
            .select(
              "id, titulo, descripcion, foto_url, jornada_id, created_at"
            )
            .eq("activa", true)
            .order("created_at", { ascending: false }),

          supabase
            .from("jornadas")
            .select("id, numero, nombre")
            .order("numero"),
        ]);

      setFotos((fotosData ?? []) as Foto[]);
      setJornadas((jornadasData ?? []) as Jornada[]);
      setCargando(false);
    }

    cargarDatos();
  }, []);

  const fotosFiltradas =
    filtro === null
      ? fotos
      : fotos.filter((foto) => foto.jornada_id === filtro);

  const fotoActual =
    fotoAbierta !== null ? fotosFiltradas[fotoAbierta] : null;

  function abrirFoto(index: number) {
    setFotoAbierta(index);
    document.body.style.overflow = "hidden";
  }

  function cerrarFoto() {
    setFotoAbierta(null);
    document.body.style.overflow = "";
  }

  function siguienteFoto() {
    if (fotoAbierta === null || fotosFiltradas.length === 0) return;

    setFotoAbierta(
      fotoAbierta === fotosFiltradas.length - 1 ? 0 : fotoAbierta + 1
    );
  }

  function anteriorFoto() {
    if (fotoAbierta === null || fotosFiltradas.length === 0) return;

    setFotoAbierta(
      fotoAbierta === 0 ? fotosFiltradas.length - 1 : fotoAbierta - 1
    );
  }

  function seleccionarFiltro(id: number | null) {
    setFiltro(id);
    setFotoAbierta(null);
  }

  const jornadaSeleccionada =
    filtro === null
      ? null
      : jornadas.find((jornada) => jornada.id === filtro);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f5] text-zinc-900">

      {/* FONDO */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -right-24 top-72 h-80 w-80 rounded-full bg-yellow-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-red-200/30 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-green-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">

        {/* VOLVER */}
        <a
          href="/"
          className="inline-flex items-center rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-black text-zinc-600 shadow-sm backdrop-blur-xl transition hover:bg-white"
        >
          ← Volver al inicio
        </a>

        {/* CABECERA */}
        <header className="mb-8 mt-8">
          <div className="inline-flex rounded-full border border-white/70 bg-white/60 px-3 py-1.5 shadow-sm backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 sm:text-xs">
              Semana del Estudiante 2026
            </p>
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Galería
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500 sm:text-base">
            Reviví los mejores momentos de cada jornada.
          </p>
        </header>

        {/* FILTROS */}
        <section className="mb-7 rounded-[1.75rem] border border-white/70 bg-white/55 p-3 shadow-sm backdrop-blur-xl">
          <div className="flex gap-2 overflow-x-auto">

            <button
              type="button"
              onClick={() => seleccionarFiltro(null)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-black transition ${
                filtro === null
                  ? "bg-zinc-950 text-white shadow-md"
                  : "bg-white/70 text-zinc-600 hover:bg-white"
              }`}
            >
              Todas
            </button>

            {jornadas.map((jornada) => (
              <button
                key={jornada.id}
                type="button"
                onClick={() => seleccionarFiltro(jornada.id)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-black transition ${
                  filtro === jornada.id
                    ? "bg-zinc-950 text-white shadow-md"
                    : "bg-white/70 text-zinc-600 hover:bg-white"
                }`}
              >
                Día {jornada.numero}
              </button>
            ))}
          </div>
        </section>

        {/* INFORMACIÓN DEL FILTRO */}
        {!cargando && (
          <div className="mb-5 flex items-end justify-between gap-4 px-1">
            <div>
              <h2 className="text-lg font-black text-zinc-800">
                {jornadaSeleccionada
                  ? `Día ${jornadaSeleccionada.numero}`
                  : "Todas las fotos"}
              </h2>

              {jornadaSeleccionada && (
                <p className="mt-0.5 text-xs font-semibold text-zinc-400">
                  {jornadaSeleccionada.nombre}
                </p>
              )}
            </div>

            <span className="shrink-0 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-zinc-500 shadow-sm backdrop-blur">
              {fotosFiltradas.length === 1
                ? "1 foto"
                : `${fotosFiltradas.length} fotos`}
            </span>
          </div>
        )}

        {/* CARGANDO */}
        {cargando && (
          <div className="rounded-[2rem] border border-white/70 bg-white/60 p-10 text-center shadow-sm backdrop-blur-xl">
            <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-800" />

            <p className="text-sm font-bold text-zinc-500">
              Cargando galería...
            </p>
          </div>
        )}

        {/* VACÍA */}
        {!cargando && fotosFiltradas.length === 0 && (
          <div className="rounded-[2rem] border border-white/70 bg-white/60 p-10 text-center shadow-sm backdrop-blur-xl">
            <div className="text-4xl">📷</div>

            <p className="mt-4 font-black text-zinc-700">
              Todavía no hay fotos
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Las imágenes de esta jornada aparecerán acá.
            </p>
          </div>
        )}

        {/* GALERÍA */}
        {!cargando && fotosFiltradas.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {fotosFiltradas.map((foto, index) => (
              <button
                key={foto.id}
                type="button"
                onClick={() => abrirFoto(index)}
                className="group relative aspect-square overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/60 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:rounded-[1.75rem]"
              >
                <img
                  src={foto.foto_url}
                  alt="Foto de la Semana del Estudiante"
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-sm text-white opacity-0 shadow backdrop-blur-md transition group-hover:opacity-100">
                  ↗
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VISOR */}
      {fotoActual && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 backdrop-blur-md sm:p-8"
          onClick={cerrarFoto}
        >

          {/* CERRAR */}
          <button
            type="button"
            onClick={cerrarFoto}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl font-light text-white backdrop-blur-xl transition hover:bg-white/25 sm:right-6 sm:top-6"
            aria-label="Cerrar"
          >
            ×
          </button>

          {/* CONTADOR */}
          <div className="absolute left-4 top-5 z-20 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-xl sm:left-6 sm:top-6">
            {(fotoAbierta ?? 0) + 1} / {fotosFiltradas.length}
          </div>

          {/* ANTERIOR */}
          {fotosFiltradas.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                anteriorFoto();
              }}
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white backdrop-blur-xl transition hover:bg-white/25 sm:left-6 sm:h-12 sm:w-12"
              aria-label="Foto anterior"
            >
              ‹
            </button>
          )}

          {/* FOTO COMPLETA */}
          <img
            src={fotoActual.foto_url}
            alt="Foto ampliada"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[94vw] rounded-2xl object-contain shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
          />

          {/* SIGUIENTE */}
          {fotosFiltradas.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                siguienteFoto();
              }}
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-2xl text-white backdrop-blur-xl transition hover:bg-white/25 sm:right-6 sm:h-12 sm:w-12"
              aria-label="Foto siguiente"
            >
              ›
            </button>
          )}
        </div>
      )}
    </main>
  );
}