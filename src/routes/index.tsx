import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/universe/Experience";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Parizodam... sen uchun ❤️ — Bizning Kichik Olamimiz" },
      { name: "description", content: "Parizoda uchun yurakdan yaratilgan sehrli 3D olam: atirgullar, xotiralar va samimiy maktub." },
      { property: "og:title", content: "Parizodam... sen uchun ❤️" },
      { property: "og:description", content: "Parizoda uchun yaratilgan sehrli 3D olam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Experience,
});
