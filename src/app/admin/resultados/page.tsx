"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Resultado = {
  candidato_id: number;
  nombre: string;
  categoria: "miss" | "mister";
  equipo_id: number;
  votos: number;
  desempate_orden: number | null;
};

type PuntajeEquipo = {
  equipo_id: number;
  miss: number;
  mister: number;
  total: number;
};

export default function ResultadosVotacionPage() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [cantidadVotantes, setCantidadVotantes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [guardandoDesempate, setGuardandoDesempate] = useState<
    number | null
  >(null);

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarResultados(mostrarCarga = false) {
      if (mostrarCarga && activo) {
        setCargando(true);
      }

      const { data: candidatos, error: candidatosError } =
        await supabase
          .from("candidatos")
          .select(
            "id, nombre, categoria, equipo_id, desempate_orden"
          )
          .eq("edicion_id", 1)
          .eq("activo", true);

      if (candidatosError) {
        if (activo) {
          setMensaje(
            `Error candidatos: ${candidatosError.message}`
          );
          setCargando(false);
        }
        return;
      }

      /*
       * IMPORTANTE:
       * Traemos TODOS los votos y hacemos el conteo acá.
       * Así /admin/resultados no depende de un conteo viejo.
       */
      let votos: { candidato_id: number; user_id: string }[] = [];
let desde = 0;
const TAMANO_PAGINA = 1000;

while (true) {
  const { data: pagina, error: votosError } = await supabase
    .from("votos")
    .select("candidato_id, user_id")
    .range(desde, desde + TAMANO_PAGINA - 1);

  if (votosError) {
    if (activo) {
      setMensaje(`Error votos: ${votosError.message}`);
      setCargando(false);
    }
    return;
  }

  const filas = pagina ?? [];
  votos = [...votos, ...filas];

  if (filas.length < TAMANO_PAGINA) {
    break;
  }

  desde += TAMANO_PAGINA;
}

      const conteo = new Map<number, number>();

      for (const voto of votos ?? []) {
        conteo.set(
          voto.candidato_id,
          (conteo.get(voto.candidato_id) ?? 0) + 1
        );
      }

      const lista: Resultado[] = (candidatos ?? []).map(
        (candidato) => ({
          candidato_id: candidato.id,
          nombre: candidato.nombre,
          categoria: candidato.categoria,
          equipo_id: candidato.equipo_id,
          votos: conteo.get(candidato.id) ?? 0,
          desempate_orden:
            candidato.desempate_orden ?? null,
        })
      );

      /*
       * Una persona puede tener voto de Miss y voto de Mister.
       * Por eso contamos user_id únicos para mostrar
       * "personas participaron".
       */
      const usuariosUnicos = new Set(
        (votos ?? [])
          .map((voto) => voto.user_id)
          .filter(Boolean)
      );

      if (activo) {
        setCantidadVotantes(usuariosUnicos.size);
        setResultados(lista);
        setMensaje("");
        setCargando(false);
      }
    }

    cargarResultados(true);

    const intervalo = window.setInterval(() => {
      cargarResultados(false);
    }, 5000);

    return () => {
      activo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  function ordenarCategoria(lista: Resultado[]) {
    return [...lista].sort((a, b) => {
      if (b.votos !== a.votos) {
        return b.votos - a.votos;
      }

      const ordenA = a.desempate_orden ?? 999;
      const ordenB = b.desempate_orden ?? 999;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return a.candidato_id - b.candidato_id;
    });
  }

  const miss = useMemo(
    () =>
      ordenarCategoria(
        resultados.filter(
          (resultado) => resultado.categoria === "miss"
        )
      ),
    [resultados]
  );

  const mister = useMemo(
    () =>
      ordenarCategoria(
        resultados.filter(
          (resultado) => resultado.categoria === "mister"
        )
      ),
    [resultados]
  );

  function obtenerGruposEmpatados(lista: Resultado[]) {
    const mapa = new Map<number, Resultado[]>();

    lista.forEach((resultado) => {
      const grupo = mapa.get(resultado.votos) ?? [];
      grupo.push(resultado);
      mapa.set(resultado.votos, grupo);
    });

    return Array.from(mapa.values())
      .filter((grupo) => grupo.length > 1)
      .sort((a, b) => b[0].votos - a[0].votos);
  }

  function grupoDesempateResuelto(grupo: Resultado[]) {
    const ordenes = grupo.map(
      (resultado) => resultado.desempate_orden
    );

    if (ordenes.some((orden) => orden === null)) {
      return false;
    }

    const numeros = ordenes as number[];

    if (new Set(numeros).size !== grupo.length) {
      return false;
    }

    return numeros.every(
      (orden) => orden >= 1 && orden <= grupo.length
    );
  }

  function categoriaResuelta(lista: Resultado[]) {
    if (lista.length !== 4) return false;

    const totalVotos = lista.reduce(
      (total, resultado) => total + resultado.votos,
      0
    );

    if (totalVotos === 0) return false;

    const gruposEmpatados =
      obtenerGruposEmpatados(lista);

    return gruposEmpatados.every((grupo) =>
      grupoDesempateResuelto(grupo)
    );
  }

  const missResuelta = categoriaResuelta(miss);
  const misterResuelto = categoriaResuelta(mister);

  const puedeCalcular =
    missResuelta &&
    misterResuelto &&
    miss.length === 4 &&
    mister.length === 4;

  function puntosPorPuesto(index: number) {
    if (index === 0) return 300;
    if (index === 1) return 250;
    if (index === 2) return 200;
    if (index === 3) return 150;

    return 0;
  }

  const puntajesEquipos: PuntajeEquipo[] = useMemo(() => {
    const mapa = new Map<number, PuntajeEquipo>();

    [1, 2, 3, 4].forEach((equipoId) => {
      mapa.set(equipoId, {
        equipo_id: equipoId,
        miss: 0,
        mister: 0,
        total: 0,
      });
    });

    if (!puedeCalcular) {
      return Array.from(mapa.values());
    }

    miss.forEach((resultado, index) => {
      const actual = mapa.get(resultado.equipo_id);

      if (actual) {
        actual.miss = puntosPorPuesto(index);
      }
    });

    mister.forEach((resultado, index) => {
      const actual = mapa.get(resultado.equipo_id);

      if (actual) {
        actual.mister = puntosPorPuesto(index);
      }
    });

    return Array.from(mapa.values()).map((equipo) => ({
      ...equipo,
      total: equipo.miss + equipo.mister,
    }));
  }, [miss, mister, puedeCalcular]);

  async function cambiarDesempate(
    candidatoId: number,
    valor: string
  ) {
    const nuevoOrden =
      valor === "" ? null : Number(valor);

    setGuardandoDesempate(candidatoId);
    setMensaje("");

    const { error } = await supabase
      .from("candidatos")
      .update({
        desempate_orden: nuevoOrden,
      })
      .eq("id", candidatoId);

    if (error) {
      setMensaje(
        `No se pudo guardar el desempate: ${error.message}`
      );

      setGuardandoDesempate(null);
      return;
    }

    setResultados((actuales) =>
      actuales.map((resultado) =>
        resultado.candidato_id === candidatoId
          ? {
              ...resultado,
              desempate_orden: nuevoOrden,
            }
          : resultado
      )
    );

    setGuardandoDesempate(null);
  }

  async function guardarPuntos() {
    setMensaje("");

    if (!puedeCalcular) {
      setMensaje(
        "Todavía hay resultados pendientes o empates sin resolver."
      );
      return;
    }

    setGuardando(true);

    const { data: juego, error: juegoError } =
      await supabase
        .from("juegos")
        .select("id")
        .eq("nombre", "Miss y Mister")
        .single();

    if (juegoError || !juego) {
      setMensaje(
        "No se encontró el juego “Miss y Mister”."
      );

      setGuardando(false);
      return;
    }

    const ordenados = [...puntajesEquipos].sort(
      (a, b) => b.total - a.total
    );

    const filas = ordenados.map((equipo) => {
      const posicion =
        ordenados.findIndex(
          (otro) => otro.total === equipo.total
        ) + 1;

      return {
        juego_id: juego.id,
        equipo_id: equipo.equipo_id,
        posicion,
        puntos: equipo.total,
      };
    });

    const { error } = await supabase
      .from("resultados")
      .upsert(filas, {
        onConflict: "juego_id,equipo_id",
      });

    if (error) {
      setMensaje(
        `No se pudieron guardar los puntos: ${error.message}`
      );

      setGuardando(false);
      return;
    }

    setMensaje(
      "Puntos de Miss & Mister guardados correctamente en la clasificación."
    );

    setGuardando(false);
  }

  function nombreEquipo(id: number) {
    if (id === 1) return "Verde";
    if (id === 2) return "Amarillo";
    if (id === 3) return "Azul";

    return "Rojo";
  }

  function colorEquipo(id: number) {
    if (id === 1) return "bg-green-500";
    if (id === 2) return "bg-yellow-400";
    if (id === 3) return "bg-blue-500";

    return "bg-red-500";
  }

  function medalla(index: number) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return `${index + 1}°`;
  }

  function renderDesempates(
    lista: Resultado[],
    categoria: "Miss" | "Mister"
  ) {
    const totalVotos = lista.reduce(
      (total, resultado) => total + resultado.votos,
      0
    );

    if (totalVotos === 0) return null;

    const grupos = obtenerGruposEmpatados(lista);

    if (grupos.length === 0) return null;

    return (
      <div className="mt-5 space-y-4">
        {grupos.map((grupo) => {
          const resuelto =
            grupoDesempateResuelto(grupo);

          return (
            <div
              key={`${categoria}-${grupo[0].votos}`}
              className={`rounded-2xl border p-4 ${
                resuelto
                  ? "border-green-200 bg-green-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.15em] text-zinc-500">
                {resuelto
                  ? "Desempate resuelto"
                  : "Resolver desempate"}
              </p>

              <p className="mt-1 text-sm font-bold text-zinc-800">
                {grupo.length} candidatos tienen{" "}
                {grupo[0].votos}{" "}
                {grupo[0].votos === 1
                  ? "voto"
                  : "votos"}
              </p>

              <div className="mt-3 space-y-2">
                {[...grupo]
                  .sort(
                    (a, b) =>
                      (a.desempate_orden ?? 999) -
                      (b.desempate_orden ?? 999)
                  )
                  .map((resultado) => (
                    <div
                      key={resultado.candidato_id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {resultado.nombre}
                        </p>

                        <p className="text-[11px] font-semibold text-zinc-400">
                          Equipo{" "}
                          {nombreEquipo(
                            resultado.equipo_id
                          )}
                        </p>
                      </div>

                      <select
                        value={
                          resultado.desempate_orden ?? ""
                        }
                        disabled={
                          guardandoDesempate ===
                          resultado.candidato_id
                        }
                        onChange={(e) =>
                          cambiarDesempate(
                            resultado.candidato_id,
                            e.target.value
                          )
                        }
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-black outline-none"
                      >
                        <option value="">Orden</option>

                        {Array.from(
                          { length: grupo.length },
                          (_, index) => index + 1
                        ).map((orden) => (
                          <option
                            key={orden}
                            value={orden}
                          >
                            {orden}.º
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>

              {!resuelto && (
                <p className="mt-3 text-xs font-semibold text-amber-700">
                  Cada candidato empatado debe tener un
                  orden diferente.
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function renderCategoria(
    titulo: "Miss" | "Mister",
    lista: Resultado[],
    resuelta: boolean
  ) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              Categoría
            </p>

            <h2 className="mt-1 text-2xl font-black">
              {titulo}
            </h2>
          </div>

          <div className="rounded-2xl bg-zinc-950 px-3 py-2 text-xs font-black text-white">
            {lista.reduce(
              (total, resultado) =>
                total + resultado.votos,
              0
            )}{" "}
            votos
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {lista.map((resultado, index) => (
            <div
              key={resultado.candidato_id}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                resuelta && index === 0
                  ? "border border-zinc-200 bg-zinc-100"
                  : "bg-zinc-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-black text-white">
                  {resuelta ? medalla(index) : "—"}
                </div>

                <div>
                  <p className="font-black">
                    {resultado.nombre}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${colorEquipo(
                        resultado.equipo_id
                      )}`}
                    />

                    <p className="text-xs font-bold text-zinc-500">
                      Equipo{" "}
                      {nombreEquipo(
                        resultado.equipo_id
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xl font-black">
                  {resultado.votos}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  votos
                </p>

                <p className="mt-1 text-xs font-black text-zinc-700">
                  {resuelta
                    ? `${puntosPorPuesto(index)} pts`
                    : "Pendiente"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {renderDesempates(lista, titulo)}
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin"
          className="mb-6 inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-black text-zinc-600 shadow-sm"
        >
          ← Volver al panel
        </a>

        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Semana del Estudiante 2026
        </p>

        <h1 className="mt-2 text-3xl font-black">
          Resultados Miss & Mister
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Cada categoría otorga 300 / 250 / 200 / 150
          puntos.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold shadow-sm">
          👥 {cantidadVotantes}{" "}
          {cantidadVotantes === 1
            ? "persona participó"
            : "personas participaron"}
        </div>

        {mensaje && (
          <p className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold shadow-sm">
            {mensaje}
          </p>
        )}

        {cargando ? (
          <p className="mt-8 text-sm text-zinc-500">
            Cargando resultados...
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {renderCategoria(
                "Miss",
                miss,
                missResuelta
              )}

              {renderCategoria(
                "Mister",
                mister,
                misterResuelto
              )}
            </div>

            <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
                Puntaje final
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Total por equipo
              </h2>

              <div className="mt-5 space-y-3">
                {[...puntajesEquipos]
                  .sort((a, b) => b.total - a.total)
                  .map((equipo) => (
                    <div
                      key={equipo.equipo_id}
                      className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-4 w-4 rounded-full ${colorEquipo(
                            equipo.equipo_id
                          )}`}
                        />

                        <div>
                          <p className="font-black">
                            Equipo{" "}
                            {nombreEquipo(
                              equipo.equipo_id
                            )}
                          </p>

                          <p className="text-xs font-semibold text-zinc-400">
                            {puedeCalcular
                              ? `Miss ${equipo.miss} + Mister ${equipo.mister}`
                              : "Pendiente"}
                          </p>
                        </div>
                      </div>

                      <p className="text-xl font-black">
                        {puedeCalcular
                          ? `${equipo.total} pts`
                          : "—"}
                      </p>
                    </div>
                  ))}
              </div>

              <button
                type="button"
                onClick={guardarPuntos}
                disabled={
                  guardando || !puedeCalcular
                }
                className="mt-6 w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar puntos en clasificación"}
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}