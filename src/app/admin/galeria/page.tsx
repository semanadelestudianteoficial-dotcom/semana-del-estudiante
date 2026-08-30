"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Jornada = {
  id: number;
  numero: number;
  nombre: string;
};

type FotoPublicada = {
  id: number;
  foto_url: string;
  jornada_id: number | null;
  created_at: string;
};

export default function AdminGaleriaPage() {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [jornadaId, setJornadaId] = useState("");
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [progreso, setProgreso] = useState("");
  const [fotosPublicadas, setFotosPublicadas] = useState<FotoPublicada[]>([]);
  const [eliminando, setEliminando] = useState<number | null>(null);

  useEffect(() => {
    async function cargarFotosPublicadas() {
  const { data, error } = await supabase
    .from("galeria")
    .select("id, foto_url, jornada_id, created_at")
    .eq("activa", true)
    .order("created_at", { ascending: false });

  if (error) {
    setMensaje(`Error al cargar fotos: ${error.message}`);
    return;
  }

  setFotosPublicadas((data ?? []) as FotoPublicada[]);
}
    async function cargarJornadas() {
      const { data } = await supabase
        .from("jornadas")
        .select("id, numero, nombre")
        .order("numero");

      setJornadas((data ?? []) as Jornada[]);
    }

    cargarJornadas();
    cargarFotosPublicadas();
  }, []);
async function eliminarFoto(foto: FotoPublicada) {
  const confirmar = window.confirm(
    "¿Seguro que querés eliminar esta foto? Esta acción no se puede deshacer."
  );

  if (!confirmar) return;

  setEliminando(foto.id);
  setMensaje("");

  try {
    // Obtener el nombre del archivo desde la URL
    const partes = foto.foto_url.split("/galeria/");
    const nombreArchivo = partes[1];

    if (nombreArchivo) {
      const { error: storageError } = await supabase.storage
        .from("galeria")
        .remove([nombreArchivo]);

      if (storageError) {
        throw storageError;
      }
    }

    // Borrar registro de la tabla
    const { error: dbError } = await supabase
      .from("galeria")
      .delete()
      .eq("id", foto.id);

    if (dbError) {
      throw dbError;
    }

    // Sacarla inmediatamente de pantalla
    setFotosPublicadas((anteriores) =>
      anteriores.filter((item) => item.id !== foto.id)
    );

    setMensaje("Foto eliminada correctamente.");
  } catch (error) {
    const mensajeError =
      error instanceof Error ? error.message : "Error desconocido";

    setMensaje(`No se pudo eliminar la foto: ${mensajeError}`);
  } finally {
    setEliminando(null);
  }
}
  async function optimizarImagen(archivo: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const imagen = new Image();
      const url = URL.createObjectURL(archivo);

      imagen.onload = () => {
        const maxDimension = 1920;

        let ancho = imagen.width;
        let alto = imagen.height;

        if (ancho > maxDimension || alto > maxDimension) {
          const escala = Math.min(
            maxDimension / ancho,
            maxDimension / alto
          );

          ancho = Math.round(ancho * escala);
          alto = Math.round(alto * escala);
        }

        const canvas = document.createElement("canvas");
        canvas.width = ancho;
        canvas.height = alto;

        const contexto = canvas.getContext("2d");

        if (!contexto) {
          URL.revokeObjectURL(url);
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        contexto.drawImage(imagen, 0, 0, ancho, alto);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);

            if (!blob) {
              reject(new Error("No se pudo comprimir la imagen."));
              return;
            }

            const nombre =
              archivo.name.replace(/\.[^/.]+$/, "") + ".webp";

            resolve(
              new File([blob], nombre, {
                type: "image/webp",
              })
            );
          },
          "image/webp",
          0.82
        );
      };

      imagen.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen."));
      };

      imagen.src = url;
    });
  }

  async function subirFoto() {
    if (archivos.length === 0) {
      setMensaje("Seleccioná al menos una imagen.");
      return;
    }

    if (!jornadaId) {
      setMensaje("Seleccioná una jornada.");
      return;
    }

    setSubiendo(true);
    setMensaje("");

    let subidasCorrectamente = 0;

    setProgreso(`Preparando ${archivos.length} fotos...`);

    for (const archivo of archivos) {
      setProgreso(
        `Subiendo ${subidasCorrectamente + 1} de ${archivos.length}...`
      );

      let archivoOptimizado: File;

      try {
        archivoOptimizado = await optimizarImagen(archivo);
      } catch {
        setMensaje(`No se pudo procesar ${archivo.name}.`);
        setProgreso("");
        setSubiendo(false);
        return;
      }

      const nombreArchivo = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.webp`;

      const { error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(nombreArchivo, archivoOptimizado, {
          contentType: "image/webp",
        });

      if (uploadError) {
        setMensaje(
          `Error al subir ${archivo.name}: ${uploadError.message}`
        );
        setProgreso("");
        setSubiendo(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("galeria")
        .getPublicUrl(nombreArchivo);

      const { error: insertError } = await supabase
        .from("galeria")
        .insert({
          edicion_id: 1,
          titulo: null,
          descripcion: null,
          foto_url: urlData.publicUrl,
          jornada_id: Number(jornadaId),
          activa: true,
        });

      if (insertError) {
        setMensaje(
          `Error al guardar ${archivo.name}: ${insertError.message}`
        );
        setProgreso("");
        setSubiendo(false);
        return;
      }

      subidasCorrectamente++;
    }

    previews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });

    setArchivos([]);
    setPreviews([]);
    setJornadaId("");

    setMensaje(
      subidasCorrectamente === 1
        ? "Foto subida correctamente."
        : `${subidasCorrectamente} fotos subidas correctamente.`
    );

    setProgreso("");
    setSubiendo(false);
  }

  function quitarFoto(index: number) {
    const preview = previews[index];

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setArchivos((anteriores) =>
      anteriores.filter((_, i) => i !== index)
    );

    setPreviews((anteriores) =>
      anteriores.filter((_, i) => i !== index)
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-6 text-zinc-900 sm:px-5 sm:py-8">
      <div className="mx-auto max-w-3xl">

        <a
          href="/admin"
          className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-black text-zinc-600 shadow-sm transition hover:bg-zinc-50"
        >
          ← Volver al panel
        </a>

        <header className="mb-8 mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400 sm:text-sm">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Galería
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Seleccioná las fotos, elegí la jornada y publicalas.
          </p>
        </header>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-6">

            {/* FOTOS */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                Fotos
              </label>

              <label className="mt-2 flex cursor-pointer items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm font-black text-zinc-700 transition hover:bg-zinc-100">
                📷 Seleccionar fotos

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const seleccionadas = Array.from(
                      e.target.files ?? []
                    );

                    if (seleccionadas.length > 20) {
                      setArchivos([]);
                      setPreviews([]);
                      setMensaje(
                        "Podés seleccionar un máximo de 20 fotos por vez."
                      );
                      e.target.value = "";
                      return;
                    }

                    previews.forEach((preview) => {
                      URL.revokeObjectURL(preview);
                    });

                    const nuevasPreviews = seleccionadas.map(
                      (archivo) => URL.createObjectURL(archivo)
                    );

                    setArchivos(seleccionadas);
                    setPreviews(nuevasPreviews);
                    setMensaje("");
                  }}
                  className="hidden"
                />
              </label>

              {archivos.length > 0 && (
                <p className="mt-2 text-xs font-semibold text-zinc-500">
                  {archivos.length === 1
                    ? "1 imagen seleccionada"
                    : `${archivos.length} imágenes seleccionadas`}
                </p>
              )}

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {previews.map((preview, index) => (
                    <div
                      key={preview}
                      className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100"
                    >
                      <img
                        src={preview}
                        alt={`Foto seleccionada ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => quitarFoto(index)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-sm font-black text-white shadow"
                        aria-label="Quitar foto"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* JORNADA */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                Jornada
              </label>

              <select
                value={jornadaId}
                onChange={(e) => setJornadaId(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-semibold outline-none focus:border-zinc-400"
              >
                <option value="">Seleccionar jornada</option>

                {jornadas.map((jornada) => (
                  <option key={jornada.id} value={jornada.id}>
                    Día {jornada.numero} · {jornada.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* BOTÓN */}
            <button
              type="button"
              onClick={subirFoto}
              disabled={subiendo}
              className="w-full rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white transition disabled:opacity-50"
            >
              {subiendo
                ? "Subiendo..."
                : archivos.length === 0
                ? "Subir fotos"
                : archivos.length === 1
                ? "Subir 1 foto"
                : `Subir ${archivos.length} fotos`}
            </button>

            {progreso && (
              <p className="text-center text-sm font-semibold text-zinc-600">
                {progreso}
              </p>
            )}

            {mensaje && (
              <p className="text-center text-sm font-semibold text-zinc-600">
                {mensaje}
              </p>
            )}
          </div>
        </section>
        {/* FOTOS PUBLICADAS */}
<section className="mt-8">
  <div className="mb-4 flex items-center justify-between">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
        Galería
      </p>

      <h2 className="mt-1 text-xl font-black">
        Fotos publicadas
      </h2>
    </div>

    <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white">
      {fotosPublicadas.length} fotos
    </span>
  </div>

  {fotosPublicadas.length === 0 ? (
    <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-bold text-zinc-500">
        Todavía no hay fotos publicadas.
      </p>
    </div>
  ) : (
    <div className="space-y-8">
  {jornadas.map((jornada) => {
    const fotosJornada = fotosPublicadas.filter(
      (foto) => foto.jornada_id === jornada.id
    );

    if (fotosJornada.length === 0) return null;

    return (
      <div key={jornada.id}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-zinc-800">
              Día {jornada.numero}
            </p>

            <p className="text-xs font-semibold text-zinc-400">
              {jornada.nombre}
            </p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-zinc-500 shadow-sm">
            {fotosJornada.length}{" "}
            {fotosJornada.length === 1 ? "foto" : "fotos"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotosJornada.map((foto) => (
            <div
              key={foto.id}
              className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <img
                src={foto.foto_url}
                alt={`Foto del Día ${jornada.numero}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <button
  type="button"
  onClick={() => eliminarFoto(foto)}
  disabled={eliminando === foto.id}
  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm text-white shadow-lg transition hover:bg-red-700 disabled:opacity-50"
  aria-label="Eliminar foto"
>
  {eliminando === foto.id ? "…" : "🗑"}
</button>
            </div>
          ))}
        </div>
      </div>
    );
  })}
</div>
  )}
</section>
      </div>
    </main>
  );
}