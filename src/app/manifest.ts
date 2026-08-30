import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Semana del Estudiante 2026",
    short_name: "SDE 2026",
    description:
      "Aplicación oficial de la Semana del Estudiante 2026 de Seguí.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f5",
    theme_color: "#171717",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}