import type { Metadata } from "next";
import Link from "next/link";
import { exigirSessao } from "@/lib/auth";
import { select } from "@/lib/db";
import {
  type Banner,
  type Destaque,
  buscarProdutos,
  formatarPreco,
  getConteudo,
  nomeBonito,
  produtosPorCodigo,
} from "@/lib/site";
import ImageInput from "@/components/admin/ImageInput";
import BotaoEnviar from "@/components/admin/BotaoEnviar";
import {
  adicionarDestaque,
  alternarBanner,
  criarBanner,
  editarBanner,
  excluirBanner,
  moverBanner,
  moverDestaque,
  removerDestaque,
  salvarGeral,
  salvarHistoria,
  salvarOcultos,
  salvarRotulo,
  sair,
} from "./actions";

export const metadata: Metadata = { title: "Painel do site", robots: { index: false } };
export const dynamic = "force-dynamic";

const ABAS = [
  { id: "banners", nome: "Banners" },
  { id: "destaques", nome: "Destaques" },
  { id: "loja", nome: "Página da loja" },
  { id: "ocultos", nome: "Produtos ocultos" },
] as const;

type SP = Promise<{ aba?: string; ok?: string; erro?: string; q?: string }>;

const campo = "mt-1.5 block h-11 w-full rounded-md border border-linha bg-white px-3 font-normal focus:border-azul focus:outline-none";

function paraDia(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function situacao(b: Banner) {
  const agora = Date.now();
  if (!b.ativo) return { txt: "Pausado", cor: "bg-linha text-suave" };
  if (b.inicio && Date.parse(b.inicio) > agora) return { txt: `Entra em ${new Date(b.inicio).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`, cor: "bg-amarelo/30 text-marinho" };
  if (b.fim && Date.parse(b.fim) <= agora) return { txt: "Encerrado", cor: "bg-linha text-suave" };
  return { txt: "No ar", cor: "bg-[#1fa855]/15 text-[#137a3b]" };
}

export default async function Admin({ searchParams }: { searchParams: SP }) {
  await exigirSessao();
  const sp = await searchParams;
  const aba = ABAS.some((a) => a.id === sp.aba) ? sp.aba! : "banners";

  return (
    <div className="min-h-screen bg-fundo">
      <header className="fundo-marca text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xl font-extrabold estreito">Painel do site</p>
            <p className="text-sm text-white/70">Info In Time</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-white/30 hover:bg-white/10">
              Ver site
            </Link>
            <form action={sair}>
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10">Sair</button>
            </form>
          </div>
        </div>
        <div className="faixa-logo" />
        <nav className="bg-white">
          <div className="scroll-x mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4">
            {ABAS.map((a) => (
              <Link
                key={a.id}
                href={`/admin?aba=${a.id}`}
                aria-current={a.id === aba ? "page" : undefined}
                className={`shrink-0 border-b-3 px-4 py-3 font-semibold ${
                  a.id === aba ? "border-azul text-azul" : "border-transparent text-suave hover:text-texto"
                }`}
              >
                {a.nome}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {sp.ok ? (
          <p role="status" className="mb-6 rounded-md bg-[#1fa855]/12 px-4 py-3 font-medium text-[#137a3b]">
            {sp.ok}
          </p>
        ) : null}
        {sp.erro ? (
          <p role="alert" className="mb-6 rounded-md bg-vermelho/10 px-4 py-3 font-medium text-vermelho">
            {sp.erro}
          </p>
        ) : null}

        {aba === "banners" && <AbaBanners />}
        {aba === "destaques" && <AbaDestaques q={sp.q || ""} />}
        {aba === "loja" && <AbaLoja />}
        {aba === "ocultos" && <AbaOcultos />}
      </main>
    </div>
  );
}

// ---------------- Banners ----------------

async function AbaBanners() {
  const banners = await select<Banner[]>("it_site_banners?select=*&order=ordem.asc,id.asc", "no-store");

  return (
    <div className="space-y-8">
      <section className="rounded-cartao border border-linha bg-white p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold text-marinho">Novo banner</h2>
        <p className="mt-1 text-suave">Aparece no topo da página inicial, em carrossel, na ordem da lista abaixo.</p>
        <form action={criarBanner} className="mt-5 grid gap-5 sm:grid-cols-2">
          <ImageInput
            name="imagem_desktop"
            label="Imagem para computador"
            dica="Formato largo, ideal 1920 × 600 px."
            larguraMax={1920}
            obrigatorio
          />
          <ImageInput
            name="imagem_mobile"
            label="Imagem para celular (opcional)"
            dica="Quadrada, ideal 1080 × 1080 px. Sem ela, o celular mostra a de computador."
            larguraMax={1080}
          />
          <label className="block font-semibold">
            Nome do banner
            <input name="titulo" maxLength={120} placeholder="Ex.: Promoção de tintas Epson" className={campo} />
            <span className="mt-1 block text-sm font-normal text-suave">Lido por quem usa leitor de tela.</span>
          </label>
          <label className="block font-semibold">
            Link ao clicar (opcional)
            <input name="link" maxLength={400} placeholder="/produtos?q=tinta epson" className={campo} />
            <span className="mt-1 block text-sm font-normal text-suave">Copie o endereço de uma busca ou produto do próprio site.</span>
          </label>
          <label className="block font-semibold">
            Começa em (opcional)
            <input name="inicio" type="date" className={campo} />
          </label>
          <label className="block font-semibold">
            Termina em (opcional)
            <input name="fim" type="date" className={campo} />
            <span className="mt-1 block text-sm font-normal text-suave">Sai do ar sozinho no fim desse dia.</span>
          </label>
          <div className="sm:col-span-2">
            <BotaoEnviar pendente="Publicando...">Publicar banner</BotaoEnviar>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-marinho">Banners cadastrados</h2>
        {!banners.length ? (
          <p className="mt-3 rounded-cartao border border-dashed border-linha bg-white p-6 text-suave">
            Nenhum banner ainda. Enquanto isso, a página inicial mostra a apresentação da loja.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {banners.map((b, i) => {
              const s = situacao(b);
              return (
                <li key={b.id} className="rounded-cartao border border-linha bg-white p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.imagem_desktop} alt="" className="aspect-[16/5] w-full rounded-md object-cover sm:w-64" />
                    <div className="min-w-0 flex-1">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cor}`}>{s.txt}</span>
                      <p className="mt-1 truncate font-semibold">{b.titulo || "Sem nome"}</p>
                      <p className="truncate text-sm text-suave">{b.link || "Sem link"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={moverBanner}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="direcao" value="cima" />
                        <BotaoEnviar variante="secundario" pendente="...">
                          <span aria-hidden>↑</span>
                          <span className="sr-only">Subir</span>
                        </BotaoEnviar>
                      </form>
                      <form action={moverBanner}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="direcao" value="baixo" />
                        <BotaoEnviar variante="secundario" pendente="...">
                          <span aria-hidden>↓</span>
                          <span className="sr-only">Descer</span>
                        </BotaoEnviar>
                      </form>
                      <form action={alternarBanner}>
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="ativo" value={b.ativo ? "0" : "1"} />
                        <BotaoEnviar variante="secundario">{b.ativo ? "Pausar" : "Ativar"}</BotaoEnviar>
                      </form>
                      <form action={excluirBanner}>
                        <input type="hidden" name="id" value={b.id} />
                        <BotaoEnviar variante="perigo" pendente="Excluindo..." confirmar="Excluir este banner? Não dá para desfazer.">
                          Excluir
                        </BotaoEnviar>
                      </form>
                    </div>
                  </div>
                  <details className="mt-3 border-t border-linha pt-3">
                    <summary className="cursor-pointer font-semibold text-azul">Trocar imagem ou editar</summary>
                    <form action={editarBanner} className="mt-4 grid gap-5 sm:grid-cols-2">
                      <input type="hidden" name="id" value={b.id} />
                      <ImageInput name="imagem_desktop" label="Nova imagem para computador" dica="Deixe vazio para manter a atual." larguraMax={1920} atual={b.imagem_desktop} />
                      <div>
                        <ImageInput name="imagem_mobile" label="Nova imagem para celular" dica="Deixe vazio para manter a atual." larguraMax={1080} atual={b.imagem_mobile} />
                        {b.imagem_mobile ? (
                          <label className="mt-2 flex items-center gap-2 text-sm">
                            <input type="checkbox" name="remover_mobile" value="1" /> Remover imagem de celular
                          </label>
                        ) : null}
                      </div>
                      <label className="block font-semibold">
                        Nome do banner
                        <input name="titulo" defaultValue={b.titulo || ""} maxLength={120} className={campo} />
                      </label>
                      <label className="block font-semibold">
                        Link ao clicar
                        <input name="link" defaultValue={b.link || ""} maxLength={400} className={campo} />
                      </label>
                      <label className="block font-semibold">
                        Começa em
                        <input name="inicio" type="date" defaultValue={paraDia(b.inicio)} className={campo} />
                      </label>
                      <label className="block font-semibold">
                        Termina em
                        <input name="fim" type="date" defaultValue={paraDia(b.fim)} className={campo} />
                      </label>
                      <div className="sm:col-span-2">
                        <BotaoEnviar>Salvar alterações</BotaoEnviar>
                      </div>
                    </form>
                  </details>
                  <span className="sr-only">Posição {i + 1}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------- Destaques ----------------

async function AbaDestaques({ q }: { q: string }) {
  const escolhidos = await select<Destaque[]>("it_site_destaques?select=*&order=ordem.asc", "no-store");
  const [emEstoque, resultados] = await Promise.all([
    produtosPorCodigo(escolhidos.map((d) => d.codigo)),
    q ? buscarProdutos({ busca: q, porPagina: 30 }) : Promise.resolve(null),
  ]);
  const mapa = new Map(emEstoque.map((p) => [p.codigo, p]));
  const jaTem = new Set(escolhidos.map((d) => d.codigo));

  return (
    <div className="space-y-8">
      <section className="rounded-cartao border border-linha bg-white p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold text-marinho">Adicionar produto</h2>
        <p className="mt-1 text-suave">
          Busque no estoque. Preço e foto vêm do sistema da loja, os mesmos que a Bianca usa.
        </p>
        <form action="/admin" className="mt-4 flex gap-2">
          <input type="hidden" name="aba" value="destaques" />
          <input name="q" defaultValue={q} placeholder="Nome ou código do produto" className={`${campo} mt-0`} />
          <button className="h-11 shrink-0 rounded-full bg-azul px-5 font-semibold text-white hover:brightness-110">Buscar</button>
        </form>
        {resultados && (
          <ul className="mt-4 divide-y divide-linha">
            {!resultados.itens.length && <li className="py-3 text-suave">Nada em estoque com esse nome.</li>}
            {resultados.itens.map((p) => (
              <li key={p.codigo} className="flex items-center gap-3 py-2.5">
                <Miniatura url={p.foto_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{nomeBonito(p.nome)}</p>
                  <p className="text-sm text-suave">
                    Cód. {p.codigo} · {formatarPreco(Number(p.preco))}
                    {!p.foto_url ? " · sem foto" : ""}
                  </p>
                </div>
                {jaTem.has(p.codigo) ? (
                  <span className="text-sm font-semibold text-suave">Já está</span>
                ) : (
                  <form action={adicionarDestaque}>
                    <input type="hidden" name="codigo" value={p.codigo} />
                    <input type="hidden" name="q" value={q} />
                    <BotaoEnviar pendente="...">Adicionar</BotaoEnviar>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-marinho">Destaques da página inicial</h2>
        <p className="mt-1 text-suave">
          Produto que acabar no estoque sai do site sozinho e volta quando repuser. Sem nenhum destaque escolhido, o site mostra produtos com foto.
        </p>
        {!escolhidos.length ? (
          <p className="mt-3 rounded-cartao border border-dashed border-linha bg-white p-6 text-suave">Nenhum destaque escolhido ainda.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {escolhidos.map((d) => {
              const p = mapa.get(d.codigo);
              return (
                <li key={d.codigo} className="flex flex-col gap-3 rounded-cartao border border-linha bg-white p-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Miniatura url={p?.foto_url ?? null} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p ? nomeBonito(p.nome) : `Código ${d.codigo}`}</p>
                      <p className="text-sm text-suave">
                        {p ? formatarPreco(Number(p.preco)) : <span className="font-semibold text-vermelho">Sem estoque: não aparece no site agora</span>}
                      </p>
                    </div>
                  </div>
                  <form action={salvarRotulo} className="flex items-center gap-2">
                    <input type="hidden" name="codigo" value={d.codigo} />
                    <input
                      name="rotulo"
                      defaultValue={d.rotulo || ""}
                      maxLength={24}
                      placeholder="Selo (ex.: Oferta)"
                      aria-label="Selo do produto"
                      className="h-9 w-36 rounded-md border border-linha px-2 text-sm focus:border-azul focus:outline-none"
                    />
                    <BotaoEnviar variante="secundario" pendente="...">Salvar selo</BotaoEnviar>
                  </form>
                  <div className="flex gap-2">
                    <form action={moverDestaque}>
                      <input type="hidden" name="codigo" value={d.codigo} />
                      <input type="hidden" name="direcao" value="cima" />
                      <BotaoEnviar variante="secundario" pendente="...">
                        <span aria-hidden>↑</span>
                        <span className="sr-only">Subir</span>
                      </BotaoEnviar>
                    </form>
                    <form action={moverDestaque}>
                      <input type="hidden" name="codigo" value={d.codigo} />
                      <input type="hidden" name="direcao" value="baixo" />
                      <BotaoEnviar variante="secundario" pendente="...">
                        <span aria-hidden>↓</span>
                        <span className="sr-only">Descer</span>
                      </BotaoEnviar>
                    </form>
                    <form action={removerDestaque}>
                      <input type="hidden" name="codigo" value={d.codigo} />
                      <BotaoEnviar variante="perigo" pendente="...">Remover</BotaoEnviar>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Miniatura({ url }: { url: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="size-12 shrink-0 rounded-md border border-linha object-contain" />
  ) : (
    <span className="size-12 shrink-0 rounded-md bg-fundo" />
  );
}

// ---------------- Pagina da loja ----------------

async function AbaLoja() {
  const c = await getConteudo();
  return (
    <div className="space-y-8">
      <section className="rounded-cartao border border-linha bg-white p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold text-marinho">Nossa história</h2>
        <form action={salvarHistoria} className="mt-5 grid gap-5">
          <ImageInput
            name="foto_familia"
            label="Foto da família"
            dica="Foto deitada (horizontal) fica melhor. Deixe vazio para manter a atual."
            larguraMax={1600}
            atual={c.foto_familia_url || null}
          />
          <label className="block font-semibold">
            Título
            <input name="historia_titulo" defaultValue={c.historia_titulo} maxLength={140} className={campo} />
          </label>
          <label className="block font-semibold">
            Texto
            <textarea
              name="historia_texto"
              defaultValue={c.historia_texto}
              rows={10}
              maxLength={6000}
              className="mt-1.5 block w-full rounded-md border border-linha p-3 font-normal leading-relaxed focus:border-azul focus:outline-none"
            />
            <span className="mt-1 block text-sm font-normal text-suave">Deixe uma linha em branco entre os parágrafos.</span>
          </label>
          <div>
            <BotaoEnviar>Salvar história</BotaoEnviar>
          </div>
        </form>
      </section>

      <section className="rounded-cartao border border-linha bg-white p-5 sm:p-6">
        <h2 className="text-2xl font-extrabold text-marinho">Dados gerais</h2>
        <form action={salvarGeral} className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block font-semibold">
            WhatsApp dos botões do site
            <input name="whatsapp" defaultValue={c.whatsapp} inputMode="numeric" className={campo} />
            <span className="mt-1 block text-sm font-normal text-suave">Com 55 e DDD, só números. Ex.: 5524988138858</span>
          </label>
          <ImageInput name="logo" label="Logo" dica="Quadrada. Deixe vazio para manter a atual." larguraMax={512} atual={c.logo_url || null} />
          <div className="sm:col-span-2">
            <BotaoEnviar>Salvar dados gerais</BotaoEnviar>
          </div>
        </form>
      </section>
    </div>
  );
}

// ---------------- Ocultos ----------------

async function AbaOcultos() {
  const c = await getConteudo();
  return (
    <section className="rounded-cartao border border-linha bg-white p-5 sm:p-6">
      <h2 className="text-2xl font-extrabold text-marinho">Produtos ocultos do site</h2>
      <p className="mt-1 max-w-2xl text-suave">
        O site mostra tudo que a Bianca pode vender. Para esconder algum item só do site (ex.: produto com nome estranho no sistema), cole o código dele aqui. Separe por vírgula.
      </p>
      <form action={salvarOcultos} className="mt-5 space-y-4">
        <textarea
          name="produtos_ocultos"
          defaultValue={c.produtos_ocultos}
          rows={5}
          placeholder="Ex.: 7815, 2679"
          aria-label="Códigos ocultos"
          className="block w-full rounded-md border border-linha p-3 focus:border-azul focus:outline-none"
        />
        <BotaoEnviar>Salvar</BotaoEnviar>
      </form>
    </section>
  );
}
