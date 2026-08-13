import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: jornadas } = await supabase
    .from("jornadas")
    .select("id, numero, nombre, fecha, estado")
    .order("numero");

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-400">
            Semana del Estudiante
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Administración
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Gestión de jornadas, juegos y resultados.
          </p>
        </header>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Jornadas 2026
            </h2>

            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white">
              4 jornadas
            </span>
          </div>

          <div className="space-y-3">
            {jornadas?.map((jornada) => (
              <div
                key={jornada.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                      Día {jornada.numero}
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      {jornada.nombre}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      {jornada.fecha ?? "Sin fecha"}
                    </p>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                    {jornada.estado}
                  </span>
                </div>

                <a
  href={`/admin/jornada/${jornada.id}`}
  className="mt-5 block w-full rounded-2xl bg-zinc-900 px-4 py-3 text-center text-sm font-bold text-white"
>
  Ver actividades
</a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}