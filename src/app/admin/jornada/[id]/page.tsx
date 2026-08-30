import { supabase } from "@/lib/supabase";
import JuegoControles from "./JuegoControles";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JornadaAdminPage({ params }: Props) {
  const { id } = await params;

  const { data: jornada } = await supabase
    .from("jornadas")
    .select("id, numero, nombre, fecha, estado")
    .eq("id", id)
    .single();

  const { data: juegos } = await supabase
    .from("juegos")
    .select(
      "id, nombre, estado, puntos_primero, puntos_segundo, puntos_tercero, puntos_cuarto, es_especial"
    )
    .eq("jornada_id", id)
    .order("id");

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-6 text-zinc-900 md:px-5 md:py-8">
      <div className="mx-auto max-w-2xl">

        {/* VOLVER */}
        <a
          href="/admin"
          className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-black text-zinc-600 shadow-sm transition hover:bg-zinc-50"
        >
          ← Volver al panel
        </a>

        {/* ENCABEZADO */}
        <header className="mb-6 mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Día {jornada?.numero}
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
            {jornada?.nombre}
          </h1>

          <p className="mt-1 text-xs text-zinc-500">
            {jornada?.fecha}
          </p>
        </header>

        {/* ACTIVIDADES */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
              Actividades
            </h2>

            <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-black text-white">
              {juegos?.length ?? 0}
            </span>
          </div>

          <div className="space-y-2.5">
            {juegos?.map((juego) => {
              const sinPuntaje =
                juego.nombre === "Presentación de Caciques y Hechiceras";

              const resultadoAutomatico =
                juego.nombre === "Presentación Miss y Míster";

              return (
                <div
                  key={juego.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  {/* NOMBRE + CONTROLES */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black leading-tight">
                        {juego.nombre}
                      </h3>

                      <p className="mt-1 text-[11px] font-semibold text-zinc-400">
                        {sinPuntaje
                          ? "Actividad sin puntaje"
                          : resultadoAutomatico
                          ? "Resultado automático por votación"
                          : juego.es_especial
                          ? "Puntaje especial"
                          : `${juego.puntos_primero} / ${juego.puntos_segundo} / ${juego.puntos_tercero} / ${juego.puntos_cuarto} pts`}
                      </p>
                    </div>

                    <JuegoControles
                      juegoId={juego.id}
                      estadoInicial={juego.estado}
                      jornadaInicial={Number(id)}
                    />
                  </div>

                  {/* CARGAR RESULTADO */}
                  {!sinPuntaje && !resultadoAutomatico && (
                    <a
                      href={`/admin/resultados/${juego.id}`}
                      className="mt-3 block w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-center text-xs font-black text-white transition active:scale-[0.98]"
                    >
                      Cargar resultado
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}