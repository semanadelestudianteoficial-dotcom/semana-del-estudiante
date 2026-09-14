import ResultadoForm from "./ResultadoForm";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ResultadoPage({ params }: Props) {
  const { id } = await params;

  const { data: juego } = await supabase
    .from("juegos")
    .select(
      "id, nombre, jornada_id, puntos_primero, puntos_segundo, puntos_tercero, puntos_cuarto, es_especial"
    )
    .eq("id", id)
    .single();

  const { data: equipos } = await supabase
    .from("equipos")
    .select("id, nombre, color_hex, orden")
    .order("orden");

  const esColecta = juego?.nombre === "Colecta";

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <a
          href={`/admin/jornada/${juego?.jornada_id}`}
          className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-black text-zinc-600 shadow-sm transition hover:bg-zinc-50"
        >
          ← Volver a la jornada
        </a>

        <header className="mb-8 mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            {esColecta ? "Cargar kilos" : "Cargar resultado"}
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {juego?.nombre}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {esColecta
              ? "Cada kilo aportado equivale a 1 punto."
              : `${juego?.puntos_primero} / ${juego?.puntos_segundo} / ${juego?.puntos_tercero} / ${juego?.puntos_cuarto} pts`}
          </p>
        </header>

        <ResultadoForm
          equipos={equipos ?? []}
          juegoId={Number(id)}
          esColecta={esColecta}
          puntosPrimero={juego?.puntos_primero ?? 0}
          puntosSegundo={juego?.puntos_segundo ?? 0}
          puntosTercero={juego?.puntos_tercero ?? 0}
          puntosCuarto={juego?.puntos_cuarto ?? 0}
        />
      </div>
    </main>
  );
}