import type { MetadataRoute } from "next";
import { buscarProdutos } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://infointime.com.br";
  const fixas = ["", "/produtos", "/assistencia-tecnica", "/nossa-historia"].map((p) => ({ url: `${site}${p}` }));
  const { itens } = await buscarProdutos({ porPagina: 2000 });
  return [...fixas, ...itens.map((p) => ({ url: `${site}/produtos/${encodeURIComponent(p.codigo)}` }))];
}
