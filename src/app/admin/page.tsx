import CerrarSesion from "./CerrarSesion";
import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: jornadas } = await supabase
    .from("jornadas")
    .select("id, numero, nombre, fecha, estado")
    .order("numero");

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-2xl">

        {/* ENCABEZADO */}
        <header className="mb-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
                Semana del Estudiante
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight">
                Administración
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Gestión de jornadas, juegos y resultados.
              </p>
            </div>

            <CerrarSesion />
          </div>
        </header>

        {/* MISS & MÍSTER */}
        <section className="mb-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Miss & Míster
            </p>

            <h2 className="mt-1 text-xl font-black">
              Votación
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Administrá la votación, los resultados y las fotos de los candidatos.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <a
              href="/admin/votacion"
              className="flex min-h-[82px] flex-col items-center justify-center rounded-2xl bg-zinc-900 px-2 py-3 text-center text-white transition active:scale-95"
            >
              <span className="text-xl">🗳️</span>
              <span className="mt-1 text-xs font-black">
                Control
              </span>
            </a>

            <a
              href="/admin/resultados"
              className="flex min-h-[82px] flex-col items-center justify-center rounded-2xl bg-zinc-100 px-2 py-3 text-center text-zinc-900 transition active:scale-95"
            >
              <span className="text-xl">📊</span>
              <span className="mt-1 text-xs font-black">
                Resultados
              </span>
            </a>

            <a
              href="/admin/fotos"
              className="flex min-h-[82px] flex-col items-center justify-center rounded-2xl bg-zinc-100 px-2 py-3 text-center text-zinc-900 transition active:scale-95"
            >
              <span className="text-xl">📷</span>
              <span className="mt-1 text-xs font-black">
                Candidatos
              </span>
            </a>
          </div>
        </section>

        {/* GALERÍA */}
        <a
          href="/admin/galeria"
          className="mb-7 flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Multimedia
            </p>

            <h2 className="mt-1 text-lg font-black">
              Galería de actividades
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Subir y administrar fotos de las jornadas.
            </p>
          </div>

          <div className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-xl">
            📸
          </div>
        </a>

        {/* JORNADAS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Jornadas 2026
            </h2>

            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white">
              {jornadas?.length ?? 0} jornadas
            </span>
          </div>

          <div className="space-y-2.5">
            {jornadas?.map((jornada) => (
              <a
                key={jornada.id}
                href={`/admin/jornada/${jornada.id}`}
                className="block rounded-3xl border border-zinc-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                        Día {jornada.numero}
                      </p>

                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                        {jornada.estado}
                      </span>
                    </div>

                    <h3 className="mt-1 truncate text-lg font-black">
                      {jornada.nombre}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">
                      {jornada.fecha ?? "Sin fecha"}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-black text-white">
                    →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}