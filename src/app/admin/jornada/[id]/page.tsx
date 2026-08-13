import { supabase } from "@/lib/supabase";

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
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <a
          href="/admin"
          className="text-sm font-semibold text-zinc-500"
        >
          ← Volver
        </a>

        <header className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Día {jornada?.numero}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {jornada?.nombre}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {jornada?.fecha}
          </p>
        </header>

        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">
            Actividades
          </h2>

          <div className="space-y-3">
            {juegos?.map((juego) => (
              <div
                key={juego.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black">
                      {juego.nombre}
                    </h3>

                    <p className="mt-1 text-xs font-semibold text-zinc-400">
                      {juego.es_especial
                        ? "Puntaje especial"
                        : `${juego.puntos_primero} / ${juego.puntos_segundo} / ${juego.puntos_tercero} / ${juego.puntos_cuarto} pts`}
                    </p>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                    {juego.estado}
                  </span>
                </div>

                <a
  href={`/admin/resultados/${juego.id}`}
  className="mt-5 block w-full rounded-2xl bg-zinc-900 px-4 py-3 text-center text-sm font-bold text-white"
>
  Cargar resultado
</a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}