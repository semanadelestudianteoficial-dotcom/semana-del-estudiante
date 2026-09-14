export default function InstalarPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-6 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <a
          href="/"
          className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-black text-zinc-600 shadow-sm"
        >
          ← Volver al inicio
        </a>

        <header className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante 2026
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Instalá la app
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Agregá Semana del Estudiante a tu celular para entrar más rápido a
            la clasificación, votación, galería y resultados.
          </p>
        </header>

        <div className="mt-8 space-y-4">
          {/* IPHONE */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white">
                
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400">
                  iPhone / iPad
                </p>

                <h2 className="text-xl font-black">
                  Instalar desde Safari
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Abrí la web desde Safari.",
                "Tocá el botón Compartir ⬆️.",
                "Elegí “Añadir a pantalla de inicio”.",
                "Tocá “Añadir”.",
                "Listo: la app aparecerá en tu pantalla de inicio.",
              ].map((paso, index) => (
                <div
                  key={paso}
                  className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-black text-white">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-sm font-semibold text-zinc-700">
                    {paso}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold text-zinc-400">
              Si abriste el enlace desde WhatsApp o Instagram, primero elegí
              abrirlo en Safari.
            </p>
          </section>

          {/* ANDROID */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-xl text-white">
                🤖
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-zinc-400">
                  Android
                </p>

                <h2 className="text-xl font-black">
                  Instalar desde Chrome
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                "Abrí la web desde Google Chrome.",
                "Tocá el menú de tres puntos ⋮.",
                "Elegí “Instalar aplicación” o “Añadir a pantalla principal”.",
                "Confirmá la instalación.",
                "Listo: la app aparecerá entre tus aplicaciones.",
              ].map((paso, index) => (
                <div
                  key={paso}
                  className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-black text-white">
                    {index + 1}
                  </span>

                  <p className="pt-1 text-sm font-semibold text-zinc-700">
                    {paso}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}