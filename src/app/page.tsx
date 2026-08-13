import { supabase } from "@/lib/supabase";
import ClasificacionAnimada from "./ClasificacionAnimada";

export default async function Home() {
  const { data: equipos, error } = await supabase
  .from("clasificacion_general")
  .select("equipo_id, nombre, color_hex, orden, puntos_totales")
  .order("puntos_totales", { ascending: false })
  .order("orden", { ascending: true });

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
          
<ClasificacionAnimada equipos={equipos ?? []} />
        </section>
      </div>
    </main>
  );
}