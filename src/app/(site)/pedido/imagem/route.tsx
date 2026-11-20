import { ImageResponse } from "next/og";
import sharp from "sharp";
import { lerPedido } from "@/lib/links";
import { montarPedido } from "@/lib/pedido";

// Imagem da previa do link do pedido no WhatsApp: as fotos de todos os itens numa
// grade so (ate 6 quadros; com mais itens o ultimo quadro vira "+N").
// - sharp converte cada foto (pode ser WebP, que o gerador de imagens do Next
//   nao le) e no fim comprime tudo em JPEG: o WhatsApp ignora imagem pesada.
// - Nao tem preco na imagem, so fotos, entao pode ficar em cache por bastante tempo.

const L = 1200;
const A = 630;
const MARGEM = 36;
const VAO = 20;
const MAX_QUADROS = 6;

async function fotoQuadrada(url: string, lado: number): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(lado, lado, { fit: "contain", background: "#ffffff" })
      .flatten({ background: "#ffffff" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const linhas = lerPedido(new URL(req.url).searchParams.get("i"));
  const itens = (await montarPedido(linhas)).filter((i) => i.produto);

  const sobra = itens.length > MAX_QUADROS ? itens.length - (MAX_QUADROS - 1) : 0;
  const mostrados = sobra ? itens.slice(0, MAX_QUADROS - 1) : itens;
  const quadros = mostrados.length + (sobra ? 1 : 0) || 1;
  const linhasGrade = quadros <= 3 ? 1 : 2;
  const colunas = Math.ceil(quadros / linhasGrade);
  const lado = Math.floor(
    Math.min((L - 2 * MARGEM - (colunas - 1) * VAO) / colunas, (A - 2 * MARGEM - (linhasGrade - 1) * VAO) / linhasGrade),
  );
  const fotoLado = lado - 24;

  const fotos = await Promise.all(
    mostrados.map((i) => (i.produto!.foto_url ? fotoQuadrada(i.produto!.foto_url, fotoLado * 2) : Promise.resolve(null))),
  );

  const quadro = (conteudo: React.ReactNode, chave: string | number) => (
    <div
      key={chave}
      style={{
        width: lado,
        height: lado,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        borderRadius: 24,
        border: "2px solid #dbe3ef",
        position: "relative",
      }}
    >
      {conteudo}
    </div>
  );

  const fila: React.ReactNode[] = mostrados.map((item, n) =>
    quadro(
      <>
        {fotos[n] ? (
          <img src={fotos[n]!} width={fotoLado} height={fotoLado} alt="" />
        ) : (
          <div style={{ display: "flex", fontSize: 28, color: "#8a97ab" }}>Cód. {item.codigo}</div>
        )}
        {item.qtd > 1 ? (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              display: "flex",
              padding: "4px 14px",
              borderRadius: 999,
              background: "#0a2a5c",
              color: "#ffffff",
              fontSize: 30,
            }}
          >
            {item.qtd}x
          </div>
        ) : null}
      </>,
      item.codigo,
    ),
  );
  if (sobra) {
    fila.push(
      quadro(
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#0a2a5c" }}>
          <div style={{ display: "flex", fontSize: Math.round(lado / 3.2) }}>+{sobra}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#5b6b82" }}>produtos</div>
        </div>,
        "mais",
      ),
    );
  }
  if (!fila.length) {
    fila.push(quadro(<div style={{ display: "flex", fontSize: 40, color: "#0a2a5c" }}>Info In Time</div>, "vazio"));
  }

  const grade: React.ReactNode[][] = [];
  for (let r = 0; r < linhasGrade; r++) grade.push(fila.slice(r * colunas, (r + 1) * colunas));

  const png = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: VAO,
          background: "#f1f5fb",
        }}
      >
        {grade.map((linha, r) => (
          <div key={r} style={{ display: "flex", gap: VAO }}>
            {linha}
          </div>
        ))}
      </div>
    ),
    { width: L, height: A },
  );

  const jpg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
