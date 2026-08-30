"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  juegoId: number;
  estadoInicial: string;
  jornadaInicial: number;
};
export default function JuegoControles({
  juegoId,
  estadoInicial,
  jornadaInicial,
}: Props) {
  const [estado, setEstado] = useState(estadoInicial);
  const [jornada, setJornada] = useState(jornadaInicial);
  const [guardando, setGuardando] = useState(false);

  async function cambiarEstado(nuevoEstado: string) {
    setGuardando(true);

    const { error } = await supabase
      .from("juegos")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", juegoId);

    if (error) {
      alert(`No se pudo cambiar el estado: ${error.message}`);
      setGuardando(false);
      return;
    }

    setEstado(nuevoEstado);
    setGuardando(false);
  }
async function cambiarJornada(nuevaJornada: number) {
  setGuardando(true);

  const { error } = await supabase
    .from("juegos")
    .update({
      jornada_id: nuevaJornada,
    })
    .eq("id", juegoId);

  if (error) {
    alert(`No se pudo mover la actividad: ${error.message}`);
    setGuardando(false);
    return;
  }

  setJornada(nuevaJornada);
  setGuardando(false);

  window.location.reload();
}
  const estilos =
    estado === "realizada"
      ? "bg-green-100 text-green-700"
      : estado === "cancelada"
      ? "bg-red-100 text-red-700"
      : "bg-zinc-100 text-zinc-600";

  return (
  <div className="flex flex-col items-end gap-2">
    <select
      value={estado}
      disabled={guardando}
      onChange={(e) => cambiarEstado(e.target.value)}
      className={`rounded-full px-3 py-2 text-xs font-black outline-none ${estilos}`}
    >
      <option value="pendiente">Pendiente</option>
      <option value="realizada">Realizada</option>
      <option value="cancelada">Cancelada</option>
    </select>

    <select
      value={jornada}
      disabled={guardando}
      onChange={(e) => cambiarJornada(Number(e.target.value))}
      className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 outline-none"
    >
      <option value={1}>Mover a Día 1</option>
      <option value={2}>Mover a Día 2</option>
      <option value={3}>Mover a Día 3</option>
      <option value={4}>Mover a Día 4</option>
    </select>
  </div>
);
}