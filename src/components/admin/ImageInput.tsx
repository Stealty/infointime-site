"use client";

import { useRef, useState } from "react";

// Reduz e converte a imagem no navegador antes de enviar (WebP). Assim uma foto
// de celular de 8 MB vira algo perto de 300 KB, o site carrega rapido e o envio
// cabe no limite da Vercel. Quem usa o painel nao precisa saber nada disso.
export default function ImageInput({
  name,
  label,
  dica,
  larguraMax,
  obrigatorio = false,
  atual,
}: {
  name: string;
  label: string;
  dica?: string;
  larguraMax: number;
  obrigatorio?: boolean;
  atual?: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [info, setInfo] = useState<string>("");
  const [processando, setProcessando] = useState(false);

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setPreview(null);
      setInfo("");
      return;
    }
    setProcessando(true);
    try {
      const bmp = await createImageBitmap(f);
      const escala = Math.min(1, larguraMax / bmp.width);
      const w = Math.round(bmp.width * escala);
      const h = Math.round(bmp.height * escala);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.85));
      if (blob && blob.size < f.size) {
        const novo = new File([blob], f.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
        const dt = new DataTransfer();
        dt.items.add(novo);
        if (ref.current) ref.current.files = dt.files;
        setInfo(`${w} × ${h} px · ${Math.round(blob.size / 1024)} KB`);
      } else {
        setInfo(`${bmp.width} × ${bmp.height} px · ${Math.round(f.size / 1024)} KB`);
      }
      setPreview(URL.createObjectURL(ref.current?.files?.[0] ?? f));
    } catch {
      setInfo("Não consegui ler esta imagem. Tente um arquivo JPG ou PNG.");
    } finally {
      setProcessando(false);
    }
  }

  const mostrar = preview || atual;

  return (
    <div>
      <label className="block font-semibold text-texto">
        {label}
        {obrigatorio ? <span className="text-vermelho"> *</span> : null}
        <input
          ref={ref}
          type="file"
          name={name}
          accept="image/*"
          required={obrigatorio}
          onChange={aoEscolher}
          className="mt-1.5 block w-full text-sm font-normal text-suave file:mr-3 file:rounded-full file:border-0 file:bg-azul file:px-4 file:py-2 file:font-semibold file:text-white hover:file:brightness-110"
        />
      </label>
      {dica ? <p className="mt-1 text-sm text-suave">{dica}</p> : null}
      {processando ? <p className="mt-1 text-sm text-azul">Preparando imagem...</p> : null}
      {info ? <p className="mt-1 text-sm text-suave">{info}</p> : null}
      {mostrar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mostrar} alt="" className="mt-2 max-h-40 rounded-md border border-linha object-contain" />
      ) : null}
    </div>
  );
}
