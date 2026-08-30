import { supabase } from "@/lib/supabase";

type Equipo = {
  id: number;
  nombre: string;
  color_hex: string;
};

type Resultado = {
  id: number;
  juego_id: number;
  equipo_id: number;
  posicion: number;
  puntos: number;
};

type Juego = {
  id: number;
  jornada_id: number;
  nombre: string;
};

type Jornada = {
  id: number;
  numero: number;
  nombre: string;
  fecha: string | null;
};

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const { data: jornadas } = await supabase
    .from("jornadas")
    .select("id, numero, nombre, fecha")
    .order("numero");

  const { data: juegos } = await supabase
    .from("juegos")
    .select("id, jornada_id, nombre")
    .order("id");

  const { data: resultados } = await supabase
    .from("resultados")
    .select("id, juego_id, equipo_id, posicion, puntos")
    .order("juego_id")
    .order("posicion");

  const { data: equipos } = await supabase
    .from("equipos")
    .select("id, nombre, color_hex")
    .order("orden");

  const listaJornadas = (jornadas ?? []) as Jornada[];
  const listaJuegos = (juegos ?? []) as Juego[];
  const listaResultados = (resultados ?? []) as Resultado[];
  const listaEquipos = (equipos ?? []) as Equipo[];

  function buscarEquipo(id: number) {
    return listaEquipos.find((equipo) => equipo.id === id);
  }

  function medalla(posicion: number) {
    if (posicion === 1) return "🥇";
    if (posicion === 2) return "🥈";
    if (posicion === 3) return "🥉";
    return `${posicion}°`;
  }

  const juegosConResultados = listaJuegos.filter((juego) =>
    listaResultados.some((resultado) => resultado.juego_id === juego.id)
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2f8] px-5 py-8 text-zinc-950">
      {/* Fondo */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-green-400/30 blur-[100px]" />
        <div className="absolute right-[-130px] top-20 h-96 w-96 rounded-full bg-blue-500/30 blur-[115px]" />
        <div className="absolute -left-28 top-[520px] h-96 w-96 rounded-full bg-yellow-300/30 blur-[110px]" />
        <div className="absolute right-[-140px] top-[900px] h-[420px] w-[420px] rounded-full bg-red-400/25 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <a
          href="/"
          className="inline-flex items-center rounded-full border border-white/80 bg-white/60 px-4 py-2 text-xs font-black text-zinc-600 shadow-sm backdrop-blur-xl"
        >
          ← Volver al inicio
        </a>

        <header className="mt-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Historial de actividades
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
            Consultá las posiciones y los puntos obtenidos en cada actividad
            disputada.
          </p>
        </header>

        {juegosConResultados.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-white/75 bg-white/55 p-6 text-center shadow-sm backdrop-blur-xl">
            <p className="text-sm font-bold text-zinc-600">
              Todavía no hay resultados cargados.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {listaJornadas.map((jornada) => {
              const juegosDeJornada = juegosConResultados.filter(
                (juego) => juego.jornada_id === jornada.id
              );

              if (juegosDeJornada.length === 0) return null;

              return (
                <section key={jornada.id}>
                  <div className="mb-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                      Día {jornada.numero}
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      {jornada.nombre}
                    </h2>

                    {jornada.fecha && (
                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                        {jornada.fecha}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {juegosDeJornada.map((juego) => {
                      const resultadosJuego = listaResultados
                        .filter(
                          (resultado) => resultado.juego_id === juego.id
                        )
                        .sort((a, b) => a.posicion - b.posicion);

                      return (
                        <article
                          key={juego.id}
                          className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/55 p-5 shadow-[0_14px_35px_rgba(31,41,55,0.08)] backdrop-blur-xl"
                        >
                          <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                                Actividad
                              </p>

                              <h3 className="mt-1 text-xl font-black">
                                {juego.nombre}
                              </h3>
                            </div>

                            <div className="rounded-full bg-zinc-950 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white">
                              Finalizado
                            </div>
                          </div>

                          <div className="space-y-2">
                            {resultadosJuego.map((resultado) => {
                              const equipo = buscarEquipo(resultado.equipo_id);

                              return (
                                <div
                                  key={resultado.id}
                                  className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                                    resultado.posicion === 1
                                      ? "border border-zinc-200 bg-white/85"
                                      : "bg-white/55"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-sm font-black text-white">
                                      {medalla(resultado.posicion)}
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="h-2.5 w-2.5 rounded-full"
                                          style={{
                                            backgroundColor:
                                              equipo?.color_hex ?? "#18181b",
                                          }}
                                        />

                                        <p className="font-black">
                                          {equipo?.nombre ??
                                            `Equipo ${resultado.equipo_id}`}
                                        </p>
                                      </div>

                                      <p className="mt-1 text-xs font-semibold text-zinc-500">
                                        {resultado.posicion}° puesto
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-xl font-black">
                                      {resultado.puntos}
                                    </p>

                                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                                      pts
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}