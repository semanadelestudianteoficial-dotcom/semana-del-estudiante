import { supabase } from "@/lib/supabase";
import ClasificacionAnimada from "./ClasificacionAnimada";
import MenuMovil from "./MenuMovil";
import BienvenidaInicial from "./BienvenidaInicial";
import AvisoDormir from "./AvisoDormir";
import AvisoImportante from "./AvisoImportante";

export const dynamic = "force-dynamic";

export default async function Home() {
  /* =========================================================
     CLASIFICACIÓN GENERAL
  ========================================================= */

  const { data: equipos, error } = await supabase
    .from("clasificacion_general")
    .select("equipo_id, nombre, color_hex, orden, puntos_totales")
    .order("puntos_totales", { ascending: false })
    .order("orden", { ascending: true });

  /* =========================================================
     ESTADO FINAL SDE
  ========================================================= */

  const { data: configuracion } = await supabase
    .from("configuracion_sde")
    .select("finalizada, finalizada_en")
    .eq("id", 1)
    .maybeSingle();

  const sdeFinalizada = configuracion?.finalizada ?? false;

  /*
   * Como la consulta de clasificación ya está ordenada
   * de mayor a menor puntaje, el primer equipo es el campeón.
   */
  const campeon =
    sdeFinalizada && equipos && equipos.length > 0
      ? equipos[0]
      : null;

  /* =========================================================
     VOTACIÓN MISS & MISTER
  ========================================================= */

  const { data: votaciones } = await supabase
    .from("votaciones")
    .select("abierta")
    .eq("edicion_id", 1);

  const votacionAbierta =
    !sdeFinalizada &&
    (votaciones ?? []).length > 0 &&
    (votaciones ?? []).every((votacion) => votacion.abierta);

  const { data: cantidadVotantes } = await supabase.rpc(
    "cantidad_votantes_2026"
  );

  /* =========================================================
     JORNADA DEL DÍA
  ========================================================= */

  const fechaArgentina = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const { data: jornadaActual } = await supabase
    .from("jornadas")
    .select("id, numero, nombre, fecha, estado")
    .eq("fecha", fechaArgentina)
    .maybeSingle();

  let actividadActual: any = null;
  let proximaActividad: any = null;

  if (jornadaActual) {
    const { data: juegosHoy } = await supabase
      .from("juegos")
      .select("id, nombre, hora, estado")
      .eq("jornada_id", jornadaActual.id)
      .order("hora", {
        ascending: true,
        nullsFirst: false,
      })
      .order("id");

    actividadActual =
      (juegosHoy ?? []).find(
        (juego) => juego.estado === "en_curso"
      ) ?? null;

    proximaActividad =
      (juegosHoy ?? []).find(
        (juego) => juego.estado === "pendiente"
      ) ?? null;
  }

  const actividadMostrada =
    actividadActual ?? proximaActividad;

  const estaEnCurso = Boolean(actividadActual);

  function formatearHora(hora: string | null) {
    if (!hora) return null;

    return hora.slice(0, 5);
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <p>Error al cargar equipos.</p>

        <p className="mt-2 text-sm text-zinc-400">
          {error.message}
        </p>
      </main>
    );
  }

  const totalVotantes = Number(cantidadVotantes ?? 0);

  /* =========================================================
     INTERFAZ
  ========================================================= */

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#eef1f7] text-zinc-950 md:min-h-screen">

      {/* Estos avisos no se muestran una vez finalizada la SDE */}
      {!sdeFinalizada && (
        <>
          <BienvenidaInicial />
          <AvisoDormir />
          <AvisoImportante />
        </>
      )}

      <MenuMovil />

      {/* =====================================================
          FONDO
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0">

        <div className="absolute -left-28 -top-24 h-80 w-80 rounded-full bg-green-400/35 blur-[90px]" />

        <div className="absolute right-[-130px] top-24 h-96 w-96 rounded-full bg-blue-500/35 blur-[110px]" />

        <div className="absolute -left-36 top-[520px] h-96 w-96 rounded-full bg-yellow-300/35 blur-[105px]" />

        <div className="absolute right-[-150px] top-[760px] h-[420px] w-[420px] rounded-full bg-red-400/30 blur-[120px]" />

        <div className="absolute inset-0 bg-white/25 backdrop-blur-[2px]" />

      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col px-4 py-3 md:block md:min-h-0 md:px-5 md:pb-12 md:pt-6">

        {/* ===================================================
            HERO NORMAL
        ==================================================== */}

        {!sdeFinalizada && (
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
        )}

        {/* ===================================================
            CAMPEÓN
        ==================================================== */}

        {sdeFinalizada && campeon && (
          <header
            className="relative overflow-hidden rounded-[2.2rem] px-6 py-9 text-white shadow-[0_22px_60px_rgba(0,0,0,0.30)]"
            style={{
              background: `linear-gradient(
                145deg,
                ${campeon.color_hex ?? "#18181b"},
                #09090b 80%
              )`,
            }}
          >

            {/* BRILLOS */}

            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/20 blur-[80px]" />

            <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-white/10 blur-[80px]" />

            <div className="relative">

              {/* ETIQUETA */}

              <div className="flex justify-center">

                <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-xl">
                  Semana del Estudiante 2026
                </div>

              </div>

              {/* COPA */}

              <div className="mt-7 text-center">

                <div className="text-7xl drop-shadow-2xl">
                  🏆
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.35em] text-white/70">
                  Campeón
                </p>

                <h1 className="mt-2 text-5xl font-black uppercase leading-none tracking-tight">
                  {campeon.nombre}
                </h1>

                <p className="mt-4 text-sm font-bold text-white/75">
                  Ganador de la Semana del Estudiante
                </p>

              </div>

              {/* PUNTAJE */}

              <div className="mt-8 rounded-[1.6rem] border border-white/15 bg-white/10 p-5 text-center backdrop-blur-xl">

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
                  Puntaje final
                </p>

                <p className="mt-1 text-4xl font-black">
                  {campeon.puntos_totales}
                </p>

                <p className="mt-1 text-xs font-bold text-white/60">
                  puntos
                </p>

              </div>

              <div className="mt-5 text-center text-sm font-bold text-white/70">
                🎉 ¡Felicitaciones!
              </div>

            </div>

          </header>
        )}

        {/* ===================================================
            JORNADA ACTUAL
        ==================================================== */}

        {!sdeFinalizada && jornadaActual && (
          <section className="mt-4">

            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/60 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl">

              <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-blue-400/15 blur-[50px]" />

              <div className="relative">

                <div className="flex items-center justify-between gap-3">

                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    Hoy · Día {jornadaActual.numero}
                  </p>

                  <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-black text-white">
                    SDE 2026
                  </span>

                </div>

                <h2 className="mt-2 text-xl font-black tracking-tight">
                  {jornadaActual.nombre}
                </h2>

                {actividadMostrada ? (

                  <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-white/70 p-4">

                    <div className="min-w-0">

                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.20em] ${
                          estaEnCurso
                            ? "text-red-600"
                            : "text-zinc-500"
                        }`}
                      >
                        {estaEnCurso
                          ? "🔴 Ahora"
                          : "Próxima actividad"}
                      </p>

                      <p className="mt-1 truncate text-base font-black">
                        {actividadMostrada.nombre}
                      </p>

                    </div>

                    {formatearHora(actividadMostrada.hora) && (

                      <div className="shrink-0 rounded-xl bg-zinc-950 px-3 py-2 text-sm font-black text-white">
                        {formatearHora(actividadMostrada.hora)}
                      </div>

                    )}

                  </div>

                ) : (

                  <div className="mt-4 rounded-2xl bg-white/70 p-4">

                    <p className="text-sm font-bold text-zinc-600">
                      ✓ Todas las actividades del día finalizaron.
                    </p>

                  </div>

                )}

              </div>

            </div>

          </section>
        )}

        {/* ===================================================
            CLASIFICACIÓN
        ==================================================== */}

        <section className="mt-5 md:mt-8">

          <div className="mb-3 flex items-end justify-between gap-3 md:mb-4 md:gap-4">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
                {sdeFinalizada
                  ? "Resultados oficiales"
                  : "Clasificación general"}
              </p>

              <h2 className="mt-0.5 text-2xl font-black tracking-tight md:mt-1 md:text-3xl">
                {sdeFinalizada
                  ? "Clasificación final"
                  : "Posiciones"}
              </h2>

            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-2 text-xs font-black shadow-sm backdrop-blur-xl">

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  sdeFinalizada
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
              />

              {sdeFinalizada
                ? "Final"
                : "En vivo"}

            </div>

          </div>

          <ClasificacionAnimada
            equipos={equipos ?? []}
          />

        </section>

        {/* ===================================================
            VOTACIÓN
        ==================================================== */}

        {!sdeFinalizada && (
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
                      votacionAbierta
                        ? "text-zinc-400"
                        : "text-zinc-500"
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
                      votacionAbierta
                        ? "text-zinc-300"
                        : "text-zinc-600"
                    }`}
                  >

                    {votacionAbierta
                      ? "Ingresá, verificá tu correo y elegí a tus candidatos."
                      : "La votación no se encuentra disponible."}

                  </p>

                </div>

                <span className="mt-1 text-3xl font-light">
                  {votacionAbierta
                    ? "→"
                    : "🔒"}
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
        )}

        {/* ===================================================
            PIE FINAL
        ==================================================== */}

        {sdeFinalizada && (
          <footer className="py-8 text-center">

            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              Semana del Estudiante
            </p>

            <p className="mt-1 text-sm font-black text-zinc-700">
              Seguí · 2026
            </p>

          </footer>
        )}

      </div>

    </main>
  );
}