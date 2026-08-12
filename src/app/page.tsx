import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: equipos, error } = await supabase
    .from("equipos")
    .select("id, nombre, color_hex, orden")
    .order("orden");

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6 text-white">
        <p>Error al cargar equipos.</p>
        <p className="mt-2 text-sm text-zinc-400">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-sm font-medium tracking-[0.28em] text-zinc-500">
            SEMANA DEL
          </p>

          <h1 className="mt-1 text-4xl font-black tracking-tight">
            ESTUDIANTE
          </h1>

          <p className="mt-1 text-sm font-semibold text-zinc-500">
            2026
          </p>
        </header>

        <section>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">
            Equipos
          </h2>

          <div className="space-y-3">
            {equipos?.map((equipo) => (
              <div
                key={equipo.id}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: equipo.color_hex }}
                  />

                  <span className="font-bold">
                    {equipo.nombre}
                  </span>
                </div>

                <span className="text-xs font-semibold text-zinc-400">
                  #{equipo.orden}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}