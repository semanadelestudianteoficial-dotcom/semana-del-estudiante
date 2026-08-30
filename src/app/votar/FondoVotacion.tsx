"use client";

import type { ReactNode } from "react";

export default function FondoVotacion({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2f8] text-zinc-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-20 -top-24 h-[360px] w-[360px] rounded-full bg-green-400/45 blur-[100px]" />

        <div className="absolute right-[-110px] top-10 h-[420px] w-[420px] rounded-full bg-blue-500/40 blur-[115px]" />

        <div className="absolute -left-24 top-[470px] h-[380px] w-[380px] rounded-full bg-yellow-300/40 blur-[110px]" />

        <div className="absolute right-[-120px] top-[700px] h-[430px] w-[430px] rounded-full bg-red-400/35 blur-[120px]" />

        <div className="absolute left-1/2 top-[260px] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-white/60 blur-[100px]" />

        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 py-7">
        {children}
      </div>
    </main>
  );
}