"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FondoVotacion from "./FondoVotacion";

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
    <FondoVotacion>
      <div className="mx-auto max-w-md py-10">
        <div className="rounded-[2rem] border border-white/70 bg-white/55 p-7 text-center shadow-[0_18px_45px_rgba(0,0,0,0.10)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-2xl text-white shadow-lg">
            🔒
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Votación cerrada
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-600">
            La votación de Miss & Mister todavía no está habilitada.
          </p>

          <p className="mt-2 text-xs font-semibold text-zinc-500">
            Volvé cuando se anuncie oficialmente la apertura.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-black text-zinc-700 shadow-sm">
            👥
            <span>
              {cantidadVotantes}{" "}
              {cantidadVotantes === 1
                ? "persona ya participó"
                : "personas ya participaron"}
            </span>
          </div>

          <a
            href="/"
            className="mt-7 block w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99]"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </FondoVotacion>
  );
}
if (verificado) {
if (votoCompletado) {
  return (
    <FondoVotacion>
      <div className="mx-auto max-w-md py-10">
        <div className="rounded-[2rem] border border-white/70 bg-white/55 p-7 text-center shadow-[0_18px_45px_rgba(31,41,55,0.10)] backdrop-blur-xl">
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-4xl font-black text-white shadow-lg">
            ✓
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Voto registrado
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-600">
            Gracias por participar en la elección de Miss & Mister.
          </p>

          <div className="mt-5 rounded-2xl border border-white/80 bg-white/65 px-4 py-3">
            <p className="text-xs font-bold leading-5 text-zinc-500">
              Tu voto quedó guardado correctamente y no puede volver a registrarse.
            </p>
          </div>

          <a
            href="/"
            className="mt-7 block w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99]"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </FondoVotacion>
  );
}  
if (mensaje === "YA_VOTO") {
  return (
    <FondoVotacion>
      <div className="mx-auto max-w-md py-10">
        <div className="rounded-[2rem] border border-white/70 bg-white/55 p-7 text-center shadow-[0_18px_45px_rgba(31,41,55,0.10)] backdrop-blur-xl">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-950 text-4xl font-black text-white shadow-lg">
            ✓
          </div>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Ya participaste
          </h1>

          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-zinc-600">
            Tu voto para Miss & Mister ya fue registrado correctamente.
          </p>

          <div className="mt-5 rounded-2xl border border-white/80 bg-white/65 px-4 py-3">
            <p className="text-xs font-bold leading-5 text-zinc-500">
              Cada persona puede participar una sola vez.
            </p>
          </div>

          <a
            href="/"
            className="mt-7 block w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99]"
          >
            Volver al inicio
          </a>

        </div>
      </div>
    </FondoVotacion>
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
    <FondoVotacion>
      <div className="mx-auto max-w-md py-4">
        <header className="mb-7 text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Confirmá tu voto
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Revisá tus elecciones antes de confirmar.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3">
          {/* MISS */}
          <div className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/55 p-3 shadow-[0_14px_35px_rgba(31,41,55,0.10)] backdrop-blur-xl">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white/50">
              {miss?.foto_url ? (
                <img
                  src={miss.foto_url}
                  alt={miss.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    📷
                  </div>
                </div>
              )}
            </div>

            <div className="px-1 pb-1 pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Miss
              </p>

              <h2 className="mt-1 text-lg font-black tracking-tight">
                {miss?.nombre}
              </h2>
            </div>
          </div>

          {/* MISTER */}
          <div className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/55 p-3 shadow-[0_14px_35px_rgba(31,41,55,0.10)] backdrop-blur-xl">
            <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white/50">
              {mister?.foto_url ? (
                <img
                  src={mister.foto_url}
                  alt={mister.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                    📷
                  </div>
                </div>
              )}
            </div>

            <div className="px-1 pb-1 pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                Mister
              </p>

              <h2 className="mt-1 text-lg font-black tracking-tight">
                {mister?.nombre}
              </h2>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={confirmarVoto}
          disabled={cargando}
          className="mt-6 w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99] disabled:opacity-40"
        >
          {cargando ? "Guardando..." : "Confirmar voto"}
        </button>

        <button
          type="button"
          onClick={() => setPasoVotacion("mister")}
          className="mt-3 w-full rounded-2xl border border-white/80 bg-white/60 px-4 py-4 text-sm font-black text-zinc-900 shadow-sm backdrop-blur-xl"
        >
          Volver
        </button>

        {mensaje && (
          <div className="mt-4 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-center">
            <p className="text-xs font-bold text-zinc-600">
              {mensaje}
            </p>
          </div>
        )}
      </div>
    </FondoVotacion>
  );
}
if (pasoVotacion === "mister") {
  return (
    <FondoVotacion>
  <div className="mx-auto max-w-4xl py-2">
    <header className="mb-7">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-zinc-400">
              Paso 2 · Mister
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Votá a tu Mister
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-300">
              Seleccioná un candidato para continuar.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-black">
            SDE
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          <div className="h-1.5 rounded-full bg-green-500" />
          <div className="h-1.5 rounded-full bg-yellow-400" />
          <div className="h-1.5 rounded-full bg-blue-500" />
          <div className="h-1.5 rounded-full bg-red-500" />
        </div>
      </div>
    </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {candidatosMister.map((candidato) => (
  <div
    key={candidato.id}
    className={`relative overflow-hidden rounded-[2rem] border p-4 shadow-[0_14px_35px_rgba(31,41,55,0.10)] backdrop-blur-xl transition ${
      misterSeleccionado === candidato.id
        ? "border-green-400 bg-white/80 ring-2 ring-green-400/30"
        : "border-white/80 bg-white/55"
    }`}
  >
    {/* FOTO */}
    <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white/50 transition-transform duration-200 active:scale-110">
      {candidato.foto_url ? (
        <img
          src={candidato.foto_url}
          alt={candidato.nombre}
          draggable={false}
          className="h-full w-full select-none object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white shadow-lg">
            📷
          </div>

          <p className="mt-3 text-xs font-bold text-zinc-500">
            Foto próximamente
          </p>
        </div>
      )}

      {misterSeleccionado === candidato.id && (
        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-lg font-black text-white shadow-lg">
          ✓
        </div>
      )}
    </div>

    {/* DATOS */}
    <div className="px-1">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            candidato.equipo_id === 1
              ? "bg-green-500"
              : candidato.equipo_id === 2
              ? "bg-yellow-400"
              : candidato.equipo_id === 3
              ? "bg-blue-500"
              : "bg-red-500"
          }`}
        />

        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
          Equipo{" "}
          {candidato.equipo_id === 1
            ? "Verde"
            : candidato.equipo_id === 2
            ? "Amarillo"
            : candidato.equipo_id === 3
            ? "Azul"
            : "Rojo"}
        </p>
      </div>

      <h2 className="mt-1 text-xl font-black tracking-tight">
        {candidato.nombre}
      </h2>

      <button
        type="button"
        onClick={() => setMisterSeleccionado(candidato.id)}
        className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition active:scale-[0.99] ${
          misterSeleccionado === candidato.id
            ? "bg-green-500 text-white"
            : "bg-zinc-950 text-white"
        }`}
      >
        {misterSeleccionado === candidato.id
          ? "Seleccionado ✓"
          : "Elegir"}
      </button>
    </div>
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
    </FondoVotacion>
  );
}
  return (
    <FondoVotacion>
  <div className="mx-auto max-w-4xl py-2">
    <header className="mb-7">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-zinc-400">
              Paso 1 · Miss
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Votá a tu Miss
            </h1>

            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-300">
              Seleccioná una candidata para continuar.
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-black">
            SDE
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          <div className="h-1.5 rounded-full bg-green-500" />
          <div className="h-1.5 rounded-full bg-yellow-400" />
          <div className="h-1.5 rounded-full bg-blue-500" />
          <div className="h-1.5 rounded-full bg-red-500" />
        </div>
      </div>
    </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {candidatasMiss.map((candidata) => (
           <div
  key={candidata.id}
  className={`relative overflow-hidden rounded-[2rem] border p-4 shadow-[0_14px_35px_rgba(31,41,55,0.10)] backdrop-blur-xl transition ${
    missSeleccionada === candidata.id
      ? "border-green-400 bg-white/80 ring-2 ring-green-400/30"
      : "border-white/80 bg-white/55"
  }`}
>
  {/* FOTO */}
  <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white/50 transition-transform duration-200 active:scale-110">
    {candidata.foto_url ? (
      <img
  src={candidata.foto_url}
  alt={candidata.nombre}
  draggable={false}
  className="h-full w-full select-none object-cover transition-transform duration-200 active:scale-125"
/>
    ) : (
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white shadow-lg">
          📷
        </div>

        <p className="mt-3 text-xs font-bold text-zinc-500">
          Foto próximamente
        </p>
      </div>
    )}

    {missSeleccionada === candidata.id && (
      <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-lg font-black text-white shadow-lg">
        ✓
      </div>
    )}
  </div>

  {/* DATOS */}
  <div className="px-1">
    <div className="flex items-center gap-2">
  <span
    className={`h-2.5 w-2.5 rounded-full ${
      candidata.equipo_id === 1
        ? "bg-green-500"
        : candidata.equipo_id === 2
        ? "bg-yellow-400"
        : candidata.equipo_id === 3
        ? "bg-blue-500"
        : "bg-red-500"
    }`}
  />

  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
    Equipo{" "}
    {candidata.equipo_id === 1
      ? "Verde"
      : candidata.equipo_id === 2
      ? "Amarillo"
      : candidata.equipo_id === 3
      ? "Azul"
      : "Rojo"}
  </p>
</div>

    <h2 className="mt-1 text-xl font-black tracking-tight">
      {candidata.nombre}
    </h2>

    <button
      type="button"
      onClick={() => setMissSeleccionada(candidata.id)}
      className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-black shadow-lg transition active:scale-[0.99] ${
        missSeleccionada === candidata.id
          ? "bg-green-500 text-white"
          : "bg-zinc-950 text-white"
      }`}
    >
      {missSeleccionada === candidata.id
        ? "Seleccionada ✓"
        : "Elegir"}
    </button>
  </div>
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
</FondoVotacion>
);
}

  return (
  <FondoVotacion>
    <div className="mx-auto max-w-md py-4">
      {/* ENCABEZADO */}
<header className="mb-7">
  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
    
    {/* brillo suave interno */}
    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

    <div className="relative">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-zinc-400">
            Miss & Mister
          </p>

          <h1 className="mt-2 text-3xl font-black leading-[0.95] tracking-tight sm:text-4xl">
            Elegí a tus
            <br />
            candidatos
          </h1>

          <p className="mt-4 max-w-[250px] text-xs font-medium leading-5 text-zinc-300">
            Verificá tu correo y participá de la votación de la Semana del Estudiante.
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-sm font-black shadow-inner">
          SDE
        </div>
      </div>

      {/* colores de los equipos */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        <div className="h-1.5 rounded-full bg-green-500" />
        <div className="h-1.5 rounded-full bg-yellow-400" />
        <div className="h-1.5 rounded-full bg-blue-500" />
        <div className="h-1.5 rounded-full bg-red-500" />
      </div>
    </div>
  </div>

  {/* CONTADOR */}
  <div className="mt-4 text-center">
    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-xs font-black text-zinc-700 shadow-sm backdrop-blur-xl">
      👥
      <span>
        {cantidadVotantes}{" "}
        {cantidadVotantes === 1
          ? "persona ya participó"
          : "personas ya participaron"}
      </span>
    </div>
  </div>
</header>

      {/* FORMULARIO GLASS */}
      <section className="rounded-[2rem] border border-white/75 bg-white/55 p-5 shadow-[0_18px_45px_rgba(31,41,55,0.10)] backdrop-blur-xl">
        <div>
          <label className="block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
            Correo electrónico
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="mt-3 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-4 text-sm font-semibold text-zinc-900 shadow-inner outline-none transition placeholder:text-zinc-400 focus:border-zinc-400"
          />
        </div>

        {codigoEnviado && (
          <div className="mt-6">
            <div className="mb-4 h-px bg-zinc-200/70" />

            <label className="block text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              Código recibido
            </label>

            <p className="mt-2 text-xs text-zinc-500">
              Revisá el correo e ingresá el código que recibiste.
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="00000000"
              className="mt-3 w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-4 text-center text-xl font-black tracking-[0.28em] text-zinc-950 shadow-inner outline-none transition placeholder:text-zinc-300 focus:border-zinc-400"
            />

            <button
              type="button"
              onClick={verificarCodigo}
              disabled={cargando || !codigo}
              className="mt-4 w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {cargando ? "Verificando..." : "Verificar código"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={enviarCodigo}
          disabled={cargando || !email}
          className={`w-full rounded-2xl px-4 py-4 text-sm font-black shadow-lg transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
            codigoEnviado
              ? "mt-3 border border-zinc-200 bg-white/70 text-zinc-800"
              : "mt-5 bg-zinc-950 text-white"
          }`}
        >
          {cargando
            ? "Enviando..."
            : codigoEnviado
            ? "Reenviar código"
            : "Enviar código"}
        </button>

        {mensaje && (
          <div className="mt-4 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-center backdrop-blur-xl">
            <p className="text-xs font-bold text-zinc-600">
              {mensaje}
            </p>
          </div>
        )}
      </section>

      <a
        href="/"
        className="mt-5 block text-center text-xs font-bold text-zinc-500"
      >
        ← Volver al inicio
      </a>
    </div>
  </FondoVotacion>
);
}