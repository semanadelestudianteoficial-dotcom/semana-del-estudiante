"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VotarPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const [codigo, setCodigo] = useState("");
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [missSeleccionada, setMissSeleccionada] = useState<number | null>(null);
  const [misterSeleccionado, setMisterSeleccionado] = useState<number | null>(null);
  const [pasoVotacion, setPasoVotacion] = useState<"miss" | "mister" | "confirmar">("miss");
  const [votoCompletado, setVotoCompletado] = useState(false);
  const [votacionAbierta, setVotacionAbierta] = useState<boolean | null>(null);
  const [cantidadVotantes, setCantidadVotantes] = useState(0);

  useEffect(() => {
  async function cargarCandidatos() {
    const { data, error } = await supabase
      .from("candidatos")
      .select("id, equipo_id, categoria, nombre, foto_url")
      .eq("activo", true)
      .order("categoria")
      .order("equipo_id");

    if (error) {
      console.error("Error al cargar candidatos:", error);
      return;
    }

    setCandidatos(data ?? []);
  }

  cargarCandidatos();
}, []);
useEffect(() => {
  async function comprobarVotacion() {
    const { data, error } = await supabase
      .from("votaciones")
      .select("abierta")
      .eq("edicion_id", 1);

    if (error) {
      setMensaje(`Error votación: ${error.message}`);
      setVotacionAbierta(false);
      return;
    }

    const abierta =
      (data ?? []).length > 0 &&
      (data ?? []).every((votacion) => votacion.abierta);

    setVotacionAbierta(abierta);
  }

 comprobarVotacion();

const intervalo = setInterval(() => {
  comprobarVotacion();
}, 5000);

return () => clearInterval(intervalo);
}, []);
useEffect(() => {
  async function cargarCantidadVotantes() {
    const { data, error } = await supabase.rpc(
      "cantidad_votantes_2026"
    );

    if (error) {
      console.error("Error al contar votantes:", error);
      return;
    }

    setCantidadVotantes(Number(data ?? 0));
  }

  cargarCantidadVotantes();
}, []);
  async function enviarCodigo() {
    setCargando(true);
    setMensaje("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
  shouldCreateUser: true,
  emailRedirectTo: `${window.location.origin}/votar`,
},
    });

    if (error) {
      setMensaje("No se pudo enviar el código.");
      setCargando(false);
      return;
    }

    setMensaje("Código enviado. Revisá tu correo.");
    setCodigoEnviado(true);
    setCargando(false);
  }
async function verificarCodigo() {
  setCargando(true);
  setMensaje("");

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: codigo.trim(),
      type: "email",
    });

    if (error) {
      setMensaje(`Error: ${error.message}`);
      return;
    }

    if (!data.session) {
      setMensaje("El código fue aceptado, pero no se inició la sesión.");
      return;
    }
const userId = data.session.user.id;

const { data: votosExistentes, error: votosError } = await supabase
  .from("votos")
  .select("id, votacion_id")
  .eq("user_id", userId);

if (votosError) {
  setMensaje(`Error votos: ${votosError.message}`);
  return;
}

if ((votosExistentes?.length ?? 0) >= 2) {
  setMensaje("YA_VOTO");
  setVerificado(true);
  return;
}
    setVerificado(true);
    setMensaje("");
  } catch {
    setMensaje("Ocurrió un error al verificar el código.");
  } finally {
    setCargando(false);
  }
}
async function confirmarVoto() {
  if (missSeleccionada === null || misterSeleccionado === null) {
    setMensaje("Tenés que elegir una Miss y un Mister.");
    return;
  }

  setCargando(true);
  setMensaje("");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setMensaje("No se pudo identificar al usuario.");
    setCargando(false);
    return;
  }

  const { error } = await supabase.from("votos").insert([
    {
      votacion_id: 1,
      candidato_id: missSeleccionada,
      user_id: user.id,
    },
    {
      votacion_id: 2,
      candidato_id: misterSeleccionado,
      user_id: user.id,
    },
  ]);

if (error) {
  if (error.code === "23505") {
    setMensaje("Ya registraste tu voto.");
  } else {
    setMensaje(`Error al guardar el voto: ${error.message}`);
  }

  setCargando(false);
  return;
}
  setVotoCompletado(true);
setMensaje("");
setCargando(false);
}
if (votacionAbierta === null) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md py-12 text-center">
        <p className="text-sm font-semibold text-zinc-500">
          Comprobando votación...
        </p>
      </div>
    </main>
  );
}
if (votacionAbierta === false) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Semana del Estudiante 2026
        </p>

        <h1 className="mt-4 text-3xl font-black">
          Votación cerrada
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          La votación de Miss & Mister todavía no está habilitada.
        </p>

        <p className="mt-2 text-xs font-semibold text-zinc-400">
          Volvé cuando se anuncie oficialmente la apertura.
        </p>
        <div className="mt-5 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm">
  👥 {cantidadVotantes}{" "}
  {cantidadVotantes === 1
    ? "persona ya participó"
    : "personas ya participaron"}
</div>
      </div>
    </main>
  );
}
if (verificado) {
if (votoCompletado) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Semana del Estudiante 2026
        </p>

        <div className="mt-10 text-6xl">
          ✓
        </div>

        <h1 className="mt-5 text-3xl font-black">
          Voto registrado correctamente
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Gracias por participar en la elección de Miss & Mister.
        </p>

        <p className="mt-2 text-xs font-semibold text-zinc-400">
          Tu voto ya quedó guardado y no puede volver a registrarse.
        </p>
      </div>
    </main>
  );
}  
if (mensaje === "YA_VOTO") {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
          Semana del Estudiante 2026
        </p>

        <h1 className="mt-4 text-3xl font-black">
          Tu voto ya fue registrado ✓
        </h1>

        <p className="mt-3 text-sm text-zinc-500">
          Gracias por participar en la elección de Miss & Mister.
        </p>
      </div>
    </main>
  );
}
  const candidatasMiss = candidatos.filter(
    (candidato) => candidato.categoria === "miss"
  );
const candidatosMister = candidatos.filter(
  (candidato) => candidato.categoria === "mister"
);
if (pasoVotacion === "confirmar") {
  const miss = candidatos.find(
    (candidato) => candidato.id === missSeleccionada
  );

  const mister = candidatos.find(
    (candidato) => candidato.id === misterSeleccionado
  );

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Confirmá tu voto
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Revisá tus elecciones antes de confirmar.
          </p>
        </header>

        <div className="space-y-4">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Miss
            </p>

            <h2 className="mt-1 text-xl font-black">
              {miss?.nombre}
            </h2>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Mister
            </p>

            <h2 className="mt-1 text-xl font-black">
              {mister?.nombre}
            </h2>
          </div>
        </div>

  <button
  type="button"
  onClick={confirmarVoto}
  disabled={cargando}
  className="mt-6 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white disabled:opacity-50"
>
  {cargando ? "Guardando..." : "Confirmar voto"}
</button>
{mensaje && (
  <p className="mt-4 text-center text-sm font-semibold text-zinc-500">
    {mensaje}
  </p>
)}

        <button
          type="button"
          onClick={() => setPasoVotacion("mister")}
          className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-black"
        >
          Volver
        </button>
      </div>
    </main>
  );
}
if (pasoVotacion === "mister") {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Votá a tu Mister
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Seleccioná un candidato.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {candidatosMister.map((candidato) => (
            <div
              key={candidato.id}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-48 items-center justify-center rounded-2xl bg-zinc-100">
                <span className="text-sm text-zinc-400">
                  Foto próximamente
                </span>
              </div>

              <h2 className="text-xl font-black">
                {candidato.nombre}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Equipo {candidato.equipo_id}
              </p>

              <button
                type="button"
                onClick={() => setMisterSeleccionado(candidato.id)}
                className={`mt-4 w-full rounded-2xl px-4 py-3 font-bold ${
                  misterSeleccionado === candidato.id
                    ? "bg-green-600 text-white"
                    : "bg-zinc-900 text-white"
                }`}
              >
                {misterSeleccionado === candidato.id
                  ? "Seleccionado ✓"
                  : "Elegir"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setPasoVotacion("miss")}
            className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-sm font-black"
          >
            Volver a Miss
          </button>

          {misterSeleccionado !== null && (
            <button
              type="button"
              onClick={() => setPasoVotacion("confirmar")}
              className="w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Votá a tu Miss
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Seleccioná una candidata.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {candidatasMiss.map((candidata) => (
            <div
              key={candidata.id}
              className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-48 items-center justify-center rounded-2xl bg-zinc-100">
                <span className="text-sm text-zinc-400">
                  Foto próximamente
                </span>
              </div>

              <h2 className="text-xl font-black">
                {candidata.nombre}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Equipo {candidata.equipo_id}
              </p>

 <button
  type="button"
  onClick={() => setMissSeleccionada(candidata.id)}
  className={`mt-4 w-full rounded-2xl px-4 py-3 font-bold ${
    missSeleccionada === candidata.id
      ? "bg-green-600 text-white"
      : "bg-zinc-900 text-white"
  }`}
>
  {missSeleccionada === candidata.id ? "Seleccionada ✓" : "Elegir"}
</button>
</div>
))}
{missSeleccionada !== null && (
  <button
    type="button"
    onClick={() => setPasoVotacion("mister")}
    className="mt-6 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white"
  >
    Continuar con Mister
  </button>
)}
</div>
</div>
</main>
);
}

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Miss & Mister
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Ingresá tu correo para recibir un código de acceso.
          </p>
          <div className="mt-5 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm">
  👥 {cantidadVotantes} {cantidadVotantes === 1 ? "persona ya participó" : "personas ya participaron"}
</div>

        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-bold text-zinc-700">
            Correo electrónico
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none"
          />
{codigoEnviado && (
  <div className="mt-5">
    <label className="block text-sm font-bold text-zinc-700">
      Código recibido
    </label>

    <input
      type="text"
      inputMode="numeric"
      value={codigo}
      onChange={(e) => setCodigo(e.target.value)}
      placeholder="Ingresá el código"
      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-center text-lg font-black tracking-[0.2em] outline-none"
    />

    <button
      type="button"
      onClick={verificarCodigo}
      disabled={cargando || !codigo}
      className="mt-4 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white disabled:opacity-50"
    >
      {cargando ? "Verificando..." : "Verificar código"}
    </button>
  </div>
)}
          <button
            type="button"
            onClick={enviarCodigo}
            disabled={cargando || !email}
            className="mt-5 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white disabled:opacity-50"
          >
            {cargando ? "Enviando..." : "Enviar código"}
          </button>

          {mensaje && (
            <p className="mt-4 text-center text-sm font-semibold text-zinc-500">
              {mensaje}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}