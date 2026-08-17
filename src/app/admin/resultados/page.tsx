"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Resultado = {
  candidato_id: number;
  nombre: string;
  categoria: "miss" | "mister";
  equipo_id: number;
  votos: number;
};

export default function ResultadosVotacionPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [cantidadVotantes, setCantidadVotantes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarResultados() {
      setCargando(true);
      setMensaje("");

      const { data: candidatos, error: candidatosError } = await supabase
        .from("candidatos")
        .select("id, nombre, categoria, equipo_id")
        .eq("edicion_id", 1)
        .eq("activo", true);

      if (candidatosError) {
        setMensaje(`Error candidatos: ${candidatosError.message}`);
        setCargando(false);
        return;
      }

      const { data: votos, error: votosError } = await supabase
        .from("votos")
        .select("candidato_id, user_id");

      if (votosError) {
        setMensaje(`Error votos: ${votosError.message}`);
        setCargando(false);
        return;
      }

      const conteo = new Map<number, number>();

      for (const voto of votos ?? []) {
        conteo.set(
          voto.candidato_id,
          (conteo.get(voto.candidato_id) ?? 0) + 1
        );
      }

      const lista: Resultado[] = (candidatos ?? []).map((candidato) => ({
        candidato_id: candidato.id,
        nombre: candidato.nombre,
        categoria: candidato.categoria,
        equipo_id: candidato.equipo_id,
        votos: conteo.get(candidato.id) ?? 0,
      }));

      const usuariosUnicos = new Set(
        (votos ?? []).map((voto) => voto.user_id)
      );

      setCantidadVotantes(usuariosUnicos.size);
      setResultados(lista);
      setCargando(false);
    }

    cargarResultados();

const intervalo = setInterval(() => {
  cargarResultados();
}, 5000);

return () => clearInterval(intervalo);
}, []);

  const miss = resultados
    .filter((resultado) => resultado.categoria === "miss")
    .sort((a, b) => b.votos - a.votos);

  const mister = resultados
    .filter((resultado) => resultado.categoria === "mister")
    .sort((a, b) => b.votos - a.votos);

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Semana del Estudiante 2026
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Resultados Miss & Mister
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Panel privado de administración.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">
          👥 {cantidadVotantes}{" "}
          {cantidadVotantes === 1
            ? "persona participó"
            : "personas participaron"}
        </div>

        {cargando && (
          <p className="mt-8 text-sm text-zinc-500">
            Cargando resultados...
          </p>
        )}

        {mensaje && (
          <p className="mt-8 rounded-2xl bg-white p-4 text-sm font-semibold shadow-sm">
            {mensaje}
          </p>
        )}

        {!cargando && !mensaje && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">
                Miss
              </h2>

              <div className="mt-5 space-y-3">
                {miss.map((resultado, index) => (
                  <div
                    key={resultado.candidato_id}
                    className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-400">
                        {index + 1}°
                      </p>

                      <p className="font-black">
                        {resultado.nombre}
                      </p>
                    </div>

                    <p className="text-lg font-black">
                      {resultado.votos}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black">
                Mister
              </h2>

              <div className="mt-5 space-y-3">
                {mister.map((resultado, index) => (
                  <div
                    key={resultado.candidato_id}
                    className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-zinc-400">
                        {index + 1}°
                      </p>

                      <p className="font-black">
                        {resultado.nombre}
                      </p>
                    </div>

                    <p className="text-lg font-black">
                      {resultado.votos}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}