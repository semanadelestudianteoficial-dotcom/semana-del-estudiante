import { supabase } from "@/lib/supabase";
import ClasificacionAnimada from "./ClasificacionAnimada";
import MenuMovil from "./MenuMovil";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: equipos, error } = await supabase
    .from("clasificacion_general")
    .select("equipo_id, nombre, color_hex, orden, puntos_totales")
    .order("puntos_totales", { ascending: false })
    .order("orden", { ascending: true });

  const { data: votaciones } = await supabase
    .from("votaciones")
    .select("abierta")
    .eq("edicion_id", 1);

  const votacionAbierta =
    (votaciones ?? []).length > 0 &&
    (votaciones ?? []).every((votacion) => votacion.abierta);

  const { data: cantidadVotantes } = await supabase.rpc(
    "cantidad_votantes_2026"
  );

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <p>Error al cargar equipos.</p>
        <p className="mt-2 text-sm text-zinc-400">{error.message}</p>
      </main>
    );
  }

  const totalVotantes = Number(cantidadVotantes ?? 0);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#eef1f7] text-zinc-950 md:min-h-screen">
      <MenuMovil />
      {/* Fondo */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-green-400/35 blur-[90px]" />
        <div className="absolute right-[-130px] top-24 h-96 w-96 rounded-full bg-blue-500/35 blur-[110px]" />
        <div className="absolute -left-36 top-[520px] h-96 w-96 rounded-full bg-yellow-300/35 blur-[105px]" />
        <div className="absolute right-[-150px] top-[760px] h-[420px] w-[420px] rounded-full bg-red-400/30 blur-[120px]" />

        <div className="absolute inset-0 bg-white/25 backdrop-blur-[2px]" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 py-3 md:block md:min-h-0 md:px-5 md:pb-12 md:pt-6">
        {/* HERO */}
        <header className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-zinc-950/95 px-6 py-7 text-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.02]" />

          <div className="relative flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.30em] text-zinc-400">
                Semana del
              </p>

              <h1 className="mt-2 text-[2.65rem] font-black leading-[0.95] tracking-tight">
                Estudiante
              </h1>

              <p className="mt-3 text-sm font-semibold text-zinc-300">
                Seguí · 2026
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner backdrop-blur-xl">
              SDE
            </div>
          </div>

          <div className="relative mt-7 grid grid-cols-4 gap-2">
            <div className="h-2 rounded-full bg-green-500" />
            <div className="h-2 rounded-full bg-yellow-400" />
            <div className="h-2 rounded-full bg-blue-500" />
            <div className="h-2 rounded-full bg-red-500" />
          </div>
        </header>

        {/* CLASIFICACIÓN */}
        <section className="mt-4 md:mt-8">
          <div className="mb-2 flex items-end justify-between gap-3 md:mb-4 md:gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                Clasificación general
              </p>

              <h2 className="mt-0.5 text-2xl font-black tracking-tight md:mt-1 md:text-3xl">
                Posiciones
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-2 text-xs font-black shadow-sm backdrop-blur-xl">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              En vivo
            </div>
          </div>

          <ClasificacionAnimada equipos={equipos ?? []} />
        </section>

        {/* VOTACIÓN */}
        <section className="mt-4 md:mt-8">
          <a
            href="/votar"
            className={`relative block overflow-hidden rounded-[2rem] border px-6 py-6 shadow-[0_16px_38px_rgba(0,0,0,0.16)] backdrop-blur-xl transition active:scale-[0.99] ${
              votacionAbierta
                ? "border-white/10 bg-zinc-950/95 text-white"
                : "border-white/70 bg-white/55 text-zinc-950"
            }`}
          >
            {votacionAbierta && (
              <>
                <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-gradient-to-b from-green-500 via-yellow-400 to-red-500" />
                <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-red-500/20 blur-[75px]" />
                <div className="absolute -left-20 -top-24 h-52 w-52 rounded-full bg-green-500/20 blur-[70px]" />
              </>
            )}

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p
                  className={`text-xs font-black uppercase tracking-[0.24em] ${
                    votacionAbierta ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Miss & Mister
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  {votacionAbierta
                    ? "Votación abierta"
                    : "Votación cerrada"}
                </h2>

                <p
                  className={`mt-3 max-w-[280px] text-sm leading-6 ${
                    votacionAbierta ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {votacionAbierta
                    ? "Ingresá, verificá tu correo y elegí a tus candidatos."
                    : "Se habilitará cuando la organización anuncie oficialmente la apertura."}
                </p>
              </div>

              <span className="mt-1 text-3xl font-light">
                {votacionAbierta ? "→" : "🔒"}
              </span>
            </div>

            <div
              className={`relative mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black ${
                votacionAbierta
                  ? "bg-white/10 text-white"
                  : "bg-white/65 text-zinc-700"
              }`}
            >
              👥
              <span>
                {totalVotantes}{" "}
                {totalVotantes === 1
                  ? "persona participó"
                  : "personas participaron"}
              </span>
            </div>
          </a>
        </section>
      </div>
    </main>
  );
}