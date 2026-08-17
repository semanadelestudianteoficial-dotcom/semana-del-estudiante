"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "semanadelestudiante.oficial@gmail.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [comprobando, setComprobando] = useState(true);

  useEffect(() => {
    async function comprobarAdmin() {
      // El login tiene que poder verse sin iniciar sesión
      if (pathname === "/admin/login") {
        setComprobando(false);
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (
        error ||
        !user ||
        user.email?.toLowerCase() !== ADMIN_EMAIL
      ) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      setComprobando(false);
    }

    comprobarAdmin();
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return children;
  }

  if (comprobando) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-zinc-900">
        <div className="mx-auto max-w-md py-12 text-center">
          <p className="text-sm font-semibold text-zinc-500">
            Comprobando acceso...
          </p>
        </div>
      </main>
    );
  }

  return children;
}