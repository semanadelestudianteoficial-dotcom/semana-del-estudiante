"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "semanadelestudiante.oficial@gmail.com";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion() {
    setCargando(true);
    setMensaje("");

    const correo = email.trim().toLowerCase();

    if (correo !== ADMIN_EMAIL) {
      setMensaje("No tenés autorización para ingresar.");
      setCargando(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password,
    });

    if (error || !data.user) {
      setMensaje("Correo o contraseña incorrectos.");
      setCargando(false);
      return;
    }

    if (data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setMensaje("No tenés autorización para ingresar.");
      setCargando(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Administración
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Iniciá sesión para gestionar resultados.
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-bold text-zinc-700">
            Correo
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none"
            placeholder="correo@ejemplo.com"
          />

          <label className="mt-5 block text-sm font-bold text-zinc-700">
            Contraseña
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none"
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={iniciarSesion}
            disabled={cargando}
            className="mt-6 w-full rounded-2xl bg-zinc-900 px-4 py-4 text-sm font-black text-white disabled:opacity-50"
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>

          {mensaje && (
            <p className="mt-3 text-center text-sm font-semibold text-red-500">
              {mensaje}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}