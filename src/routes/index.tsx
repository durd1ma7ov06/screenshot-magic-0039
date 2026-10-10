import { createFileRoute } from "@tanstack/react-router";
import { Experience } from "@/universe/Experience";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Our Little Universe — sen uchun" },
      { name: "description", content: "Yuragimdan bir hikoya: atirgullar, xotiralar va maktub bilan sehrli 3D olam." },
      { property: "og:title", content: "Our Little Universe ❤️" },
      { property: "og:description", content: "Sen uchun yaratilgan sehrli 3D olam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Experience,
});
