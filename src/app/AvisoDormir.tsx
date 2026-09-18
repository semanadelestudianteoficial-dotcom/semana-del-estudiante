"use client";

import { useEffect, useState } from "react";

type TipoAviso = "dormir" | "buenDia" | null;

const CLAVE_DORMIR = "sde_aviso_dormir_17_09_v2";
const CLAVE_BUEN_DIA = "sde_aviso_buen_dia_18_09_v1";

export default function AvisoDormir() {
  const [tipoAviso, setTipoAviso] = useState<TipoAviso>(null);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    function comprobarAviso() {
      // Obtenemos fecha y hora de Argentina
      const partes = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());

      const obtener = (tipo: string) =>
        partes.find((parte) => parte.type === tipo)?.value ?? "";

      const anio = Number(obtener("year"));
      const mes = Number(obtener("month"));
      const dia = Number(obtener("day"));
      const hora = Number(obtener("hour"));

      // NOCHE:
      // 17/09 desde ahora hasta las 23:59
      // y 18/09 desde las 00:00 hasta las 05:59
      const esHorarioDormir =
        (anio === 2026 && mes === 9 && dia === 17) ||
        (anio === 2026 && mes === 9 && dia === 18 && hora < 6);

      // MAÑANA:
      // 18/09 desde las 06:00
      const esBuenosDias =
        anio === 2026 &&
        mes === 9 &&
        dia === 18 &&
        hora >= 6;

      if (esHorarioDormir) {
        setTipoAviso("dormir");

        if (!localStorage.getItem(CLAVE_DORMIR)) {
          setMostrar(true);
        }

        return;
      }

      if (esBuenosDias) {
        setTipoAviso("buenDia");

        if (!localStorage.getItem(CLAVE_BUEN_DIA)) {
          setMostrar(true);
        }

        return;
      }

      // Fuera de las fechas del evento no mostramos nada
      setMostrar(false);
      setTipoAviso(null);
    }

    const timerInicial = setTimeout(comprobarAviso, 700);

    // También comprobamos cada minuto.
    // Si alguien deja la web abierta, a las 06:00 puede cambiar el aviso.
    const intervalo = setInterval(comprobarAviso, 60_000);

    return () => {
      clearTimeout(timerInicial);
      clearInterval(intervalo);
    };
  }, []);

  function cerrar() {
    if (tipoAviso === "dormir") {
      localStorage.setItem(CLAVE_DORMIR, "true");
    }

    if (tipoAviso === "buenDia") {
      localStorage.setItem(CLAVE_BUEN_DIA, "true");
    }

    setMostrar(false);
  }

  if (!mostrar || !tipoAviso) return null;

  // =========================
  // AVISO NOCTURNO
  // =========================

  if (tipoAviso === "dormir") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-5 backdrop-blur-md">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-[#10121a] p-6 text-center shadow-2xl">
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-12 h-48 w-48 rounded-full bg-purple-500/20 blur-[70px]" />

          <div className="relative">
            <div className="mb-4 flex h-32 items-center justify-center">
              <div className="relative">
                <span className="text-7xl">😴</span>

                <span className="absolute -right-7 -top-3 animate-pulse text-2xl font-black text-blue-300">
                  Z
                </span>

                <span className="absolute -right-12 -top-9 animate-pulse text-xl font-black text-blue-200">
                  Z
                </span>

                <span className="absolute -right-16 -top-14 animate-pulse text-sm font-black text-white">
                  Z
                </span>
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
              SDE 2026
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              ¡A dormir! 😴
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm font-medium leading-6 text-zinc-300">
              Mañana es el{" "}
              <strong className="text-white">
                último día de la SDE 2026
              </strong>
              . Se viene una jornada larga, así que carguen energías porque
              todavía queda mucho por vivir.
            </p>

            <p className="mt-4 font-black text-white">
              Nos vemos mañana para la gran final.
            </p>

            <div className="mt-2 text-xl">❤️ 💛 💙 💚</div>

            <button
              onClick={cerrar}
              className="mt-6 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-zinc-950 transition active:scale-[0.98]"
            >
              Bueno, a dormir 😴
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // AVISO DE BUENOS DÍAS
  // =========================

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-sky-950/40 px-5 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-b from-sky-100 via-white to-amber-50 p-6 text-center shadow-2xl">
        {/* Amanecer */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-yellow-300/50 blur-[55px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-sky-400/25 blur-[65px]" />

        <div className="relative">
          <div className="mb-3 flex h-32 items-center justify-center">
            <div className="relative">
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-yellow-300/30 blur-2xl" />

              <span className="relative text-7xl">☀️</span>
            </div>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-600">
            SDE 2026 · GRAN FINAL
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
            ¡Buenos días! ☀️
          </h2>

          <p className="mx-auto mt-4 max-w-sm text-sm font-semibold leading-6 text-zinc-600">
            Llegó el{" "}
            <strong className="text-zinc-950">
              último día de la SDE 2026
            </strong>
            . Esperamos que hayan cargado energías porque hoy tenemos una
            jornada larga y llena de actividades.
          </p>

          <p className="mt-4 text-lg font-black text-zinc-950">
            ¡A disfrutar la gran final! 🏆
          </p>

          <div className="mt-2 text-xl">❤️ 💛 💙 💚</div>

          <button
            onClick={cerrar}
            className="mt-6 w-full rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.98]"
          >
            ¡Vamos con todo! 🏆
          </button>
        </div>
      </div>
    </div>
  );
}