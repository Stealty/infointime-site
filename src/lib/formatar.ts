// Formatacao de nomes e precos. Sem "server-only": o carrinho usa no navegador.

export function formatarPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const SIGLAS = new Set(["HD", "SSD", "USB", "HDMI", "VGA", "RGB", "LED", "PC", "TV", "HP", "LG", "DDR3", "DDR4", "DDR5", "SATA", "NVME", "WIFI", "AC", "AX", "PDV", "UPS", "DVI", "LAN", "CAT6", "CAT5E", "GB", "TB", "MB", "W", "V", "A4", "A3", "II"]);

// O Shop 9 guarda tudo em caixa alta. No site o nome fica legivel, mas codigos
// e siglas (L3250, T544, USB, 1TB) continuam em maiusculas.
export function nomeBonito(nome: string) {
  const minusculas = new Set(["de", "da", "do", "das", "dos", "e", "para", "com", "sem", "em", "p/", "c/", "s/"]);
  return nome
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w, i) => {
      const up = w.toUpperCase();
      if (/\d/.test(w) || SIGLAS.has(up.replace(/[^A-Z0-9]/g, ""))) return up;
      const low = w.toLowerCase();
      if (i > 0 && minusculas.has(low)) return low;
      return low.charAt(0).toUpperCase() + low.slice(1);
    })
    .join(" ");
}

export function categoriaBonita(c: string) {
  if (c === "OUTROS") return "Outros";
  return nomeBonito(c.replace(/\s*\/\s*/g, " / "));
}

export function slugCategoria(c: string) {
  return encodeURIComponent(c);
}
