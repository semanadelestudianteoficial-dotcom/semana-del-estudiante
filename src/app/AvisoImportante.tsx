"use client";

import { useEffect, useState } from "react";

const CLAVE_AVISO = "sde_aviso_votacion_2026_09_16_v1";
const CLAVE_BIENVENIDA = "sde_bienvenida_2026_v1";

export default function AvisoImportante() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function comprobarAviso() {
      const yaVioBienvenida = localStorage.getItem(CLAVE_BIENVENIDA);
      const yaVioAviso = localStorage.getItem(CLAVE_AVISO);

      // El aviso solamente puede aparecer después de la bienvenida.
      if (yaVioBienvenida && !yaVioAviso) {
        setVisible(true);
      }
    }

    comprobarAviso();

    window.addEventListener("sde-bienvenida-lista", comprobarAviso);

    return () => {
      window.removeEventListener(
        "sde-bienvenida-lista",
        comprobarAviso
      );
    };
  }, []);

  function cerrarAviso() {
    localStorage.setItem(CLAVE_AVISO, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl">
        <div className="bg-zinc-950 px-6 py-5 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-400">
            Aviso importante
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight">
            Votación Miss & Mister
          </h2>
        </div>

        <div className="space-y-4 p-6 text-sm leading-6 text-zinc-700">
          <p>
            🔐{" "}
            <strong>
              Cada correo puede utilizarse una sola vez para votar.
            </strong>{" "}
            Si ya completaste tu voto, no podrás volver a participar con el
            mismo correo.
          </p>

          <p>
            📩 Al solicitar el código, <strong>pedilo una sola vez</strong> y
            esperá unos minutos. Revisá también{" "}
            <strong>Spam / Correo no deseado</strong>.
          </p>

          <p>
            ⏱️ Para evitar solicitudes repetidas, deberás esperar{" "}
            <strong>5 minutos</strong> antes de poder pedir otro código.
          </p>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <p className="font-black">
              📧 ¿Usás Hotmail u Outlook?
            </p>

            <p className="mt-1 text-xs leading-5">
              Estamos registrando inconvenientes de entrega con algunas
              cuentas de Microsoft. Si el código no llega, recomendamos
              utilizar una cuenta Gmail.
            </p>
          </div>

          <p className="text-center text-xs font-semibold text-zinc-500">
            Gracias por la paciencia 🙌 · SDE 2026
          </p>

          <button
            type="button"
            onClick={cerrarAviso}
            className="w-full rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99]"
          >
            Entendido
          </button>

          <p className="text-center text-[10px] font-semibold text-zinc-400">
            Este aviso se mostrará una sola vez.
          </p>
        </div>
      </div>
    </div>
  );
}