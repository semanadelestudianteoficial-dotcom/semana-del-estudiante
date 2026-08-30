"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Candidato = {
  id: number;
  nombre: string;
  categoria: "miss" | "mister";
  equipo_id: number;
  foto_url: string | null;
};

export default function AdminFotosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendoId, setSubiendoId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarCandidatos() {
      const { data, error } = await supabase
        .from("candidatos")
        .select("id, nombre, categoria, equipo_id, foto_url")
        .eq("edicion_id", 1)
        .eq("activo", true)
        .order("categoria")
        .order("equipo_id");

      if (error) {
        setMensaje(`Error: ${error.message}`);
        setCargando(false);
        return;
      }

      setCandidatos((data ?? []) as Candidato[]);
      setCargando(false);
    }

    cargarCandidatos();
  }, []);

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

  async function subirFoto(
    candidato: Candidato,
    archivo: File | undefined
  ) {
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setMensaje("El archivo seleccionado no es una imagen.");
      return;
    }

    setSubiendoId(candidato.id);
    setMensaje("");

    const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";

    const ruta = `${candidato.categoria}-${candidato.id}-${Date.now()}.${extension}`;

    const { error: storageError } = await supabase.storage
      .from("candidatos")
      .upload(ruta, archivo, {
  cacheControl: "3600",
  upsert: false,
});

    if (storageError) {
      setMensaje(`Error al subir imagen: ${storageError.message}`);
      setSubiendoId(null);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("candidatos")
      .getPublicUrl(ruta);

    const url = `${publicData.publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("candidatos")
      .update({
        foto_url: url,
      })
      .eq("id", candidato.id);

    if (updateError) {
      setMensaje(`Error al guardar foto: ${updateError.message}`);
      setSubiendoId(null);
      return;
    }

    setCandidatos((actuales) =>
      actuales.map((item) =>
        item.id === candidato.id
          ? {
              ...item,
              foto_url: url,
            }
          : item
      )
    );

    setMensaje(`Foto de ${candidato.nombre} actualizada correctamente.`);
    setSubiendoId(null);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <a
  href="/admin"
  className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-black text-zinc-600 shadow-sm transition hover:bg-zinc-50"
>
  ← Volver al panel
</a>
    <header className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Fotos de candidatos
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Subí o reemplazá las fotos de Miss & Mister.
          </p>
        </header>

        {mensaje && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold shadow-sm">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <p className="text-sm text-zinc-500">
            Cargando candidatos...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {candidatos.map((candidato) => (
              <div
                key={candidato.id}
                className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-zinc-100">
                  {candidato.foto_url ? (
                    <img
                      src={candidato.foto_url}
                      alt={candidato.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white">
                        📷
                      </div>

                      <p className="mt-3 text-xs font-bold text-zinc-400">
                        Sin foto
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${colorEquipo(
                        candidato.equipo_id
                      )}`}
                    />

                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                      {candidato.categoria === "miss" ? "Miss" : "Mister"} ·{" "}
                      {nombreEquipo(candidato.equipo_id)}
                    </p>
                  </div>

                  <h2 className="mt-1 text-lg font-black">
                    {candidato.nombre}
                  </h2>

                  <label className="mt-4 block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={subiendoId === candidato.id}
                      onChange={(e) =>
                        subirFoto(candidato, e.target.files?.[0])
                      }
                    />

                    <span className="block w-full rounded-2xl bg-zinc-950 px-4 py-3 text-center text-sm font-black text-white">
                      {subiendoId === candidato.id
                        ? "Subiendo..."
                        : candidato.foto_url
                        ? "Cambiar foto"
                        : "Subir foto"}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}