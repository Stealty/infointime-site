# Site Info In Time

Next.js 16 (App Router) + Tailwind 4. Hospedagem na Vercel.

## Páginas

| Rota | O que é |
|---|---|
| `/` | Banners (carrossel), destaques, categorias, assistência, tintas, lojas |
| `/produtos` | Catálogo com busca, categoria, ordenação e paginação |
| `/produtos/[codigo]` | Produto, com botão "Pedir pelo WhatsApp" |
| `/assistencia-tecnica` | Manutenção de impressoras, notebooks, PCs e nobreaks |
| `/nossa-historia` | Foto da família e texto (editáveis no painel) |
| `/admin` | Painel com login único |

## De onde vêm os produtos

Do mesmo Supabase da Bianca, pela função `it_site_catalogo`, que chama a
`it_candidatos_v2` com a política da `it_config` (`filiais_venda`,
`tabela_preco_venda`, `estoque_minimo_venda`, `estoque_teto_suspeito`).
Mudou a política para a Bianca, muda no site também. Cache de 5 minutos.

Objetos criados no banco (todos com prefixo `it_site_`, script em
`supabase/001_site.sql`, idempotente):

- `it_site_banners`, `it_site_destaques`, `it_site_conteudo` (RLS ligada, sem policy)
- funções `it_site_politica`, `it_site_categoria`, `it_site_catalogo`, `it_site_categorias` (só `service_role` executa)
- bucket público `it_site` para as imagens do painel

## Painel `/admin`

- **Banners**: imagem de computador (1920×600) e de celular opcional (1080×1080), link, data de início e fim, pausar, ordenar, trocar imagem.
- **Destaques**: busca no estoque e escolhe os produtos da home, com selo opcional ("Oferta"). Produto sem estoque some sozinho.
- **Página da loja**: foto da família, título e texto da história, WhatsApp dos botões e logo.
- **Produtos ocultos**: códigos que não devem aparecer no site.

As imagens são reduzidas e convertidas para WebP no navegador antes de subir.

## Deploy na Vercel

1. Suba esta pasta para um repositório no GitHub e importe na Vercel (framework: Next.js, sem configuração extra).
2. Em *Settings → Environment Variables*, cadastre:

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | o mesmo `SUPABASE_HOST` do `.env` do n8n |
| `SUPABASE_SERVICE_KEY` | o mesmo `SUPABASE_SERVICE_KEY` do `.env` do n8n |
| `ADMIN_USER` | usuário do painel |
| `ADMIN_PASSWORD` | senha do painel |
| `ADMIN_SECRET` | texto aleatório com 40+ caracteres |
| `NEXT_PUBLIC_SITE_URL` | `https://infointime.com.br` (ou a URL da Vercel até trocar o domínio) |

3. Faça o deploy. A service key só é usada no servidor e nunca vai para o navegador.

## Trocar o domínio

Em *Settings → Domains* na Vercel, adicione `infointime.com.br` e `www.infointime.com.br`.
A Vercel mostra os registros DNS (A para o domínio raiz, CNAME para o www) que
precisam ser trocados onde o domínio está registrado (Registro.br ou o painel da
agência que hospeda hoje). Não precisa de redirect: o domínio passa a apontar
direto para a Vercel.

## Rodar localmente

```bash
cp .env.example .env.local   # preencha as variáveis
npm install
npm run dev
```
