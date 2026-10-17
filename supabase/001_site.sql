-- Site Info In Time - objetos do site (17/10/2026). Idempotente.
-- Tudo com prefixo it_site_ (o Supabase e compartilhado entre clientes da TaskMind).
-- O catalogo usa a MESMA funcao da Bianca (it_candidatos_v2) com a MESMA politica da it_config.

create table if not exists public.it_site_banners (
  id bigserial primary key,
  titulo text,
  imagem_desktop text not null,
  imagem_mobile text,
  link text,
  ordem integer not null default 0,
  ativo boolean not null default true,
  inicio timestamptz,
  fim timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.it_site_destaques (
  codigo text primary key,
  ordem integer not null default 0,
  rotulo text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table if not exists public.it_site_conteudo (
  chave text primary key,
  valor text,
  atualizado_em timestamptz not null default now()
);

-- Sem policy: so a service key (servidor do site) le e escreve.
alter table public.it_site_banners enable row level security;
alter table public.it_site_destaques enable row level security;
alter table public.it_site_conteudo enable row level security;

insert into public.it_site_conteudo (chave, valor) values
  ('logo_url', 'https://cdn.guiase.net/wp-content/uploads/sites/3943/2024/10/cropped-Logo-Info-Im-Time-Site-2-512-x-512-px.png'),
  ('foto_familia_url', ''),
  ('historia_titulo', 'Há 30 anos cuidando da informática do Sul Fluminense'),
  ('historia_texto', 'A Info In Time nasceu em Volta Redonda e hoje atende também Barra Mansa e Arrozal. São 30 anos vendendo produtos de informática e cuidando da manutenção de notebooks, computadores e impressoras, sempre com atendimento próximo.

(Texto provisório: troque pela história da família no painel /admin.)'),
  ('whatsapp', '5524988138858'),
  ('produtos_ocultos', '')
on conflict (chave) do nothing;

insert into storage.buckets (id, name, public)
values ('it_site', 'it_site', true)
on conflict (id) do nothing;

-- Politica de venda lida da it_config, igual ao node Config do SUB - Consultar Produtos.
create or replace function public.it_site_politica()
returns table (filiais integer[], tabela integer, minimo numeric, teto numeric)
language sql stable security definer
set search_path to 'public', 'pg_temp'
as $$
  with v as (select chave, valor from public.it_config)
  select
    case
      when coalesce(btrim((select valor from v where chave = 'filiais_venda')), '') = '' then array[3]
      when lower(btrim((select valor from v where chave = 'filiais_venda'))) in ('todas', 'todos', '*') then null
      else coalesce(
        (select array_agg(x::int) from regexp_split_to_table((select valor from v where chave = 'filiais_venda'), '[^0-9]+') x where x <> ''),
        array[3])
    end,
    coalesce((select nullif(regexp_replace(valor, '[^0-9]', '', 'g'), '')::int from v where chave = 'tabela_preco_venda'), 4),
    greatest(coalesce((select nullif(replace(btrim(valor), ',', '.'), '')::numeric from v where chave = 'estoque_minimo_venda'), 1), 1),
    coalesce((select nullif(replace(btrim(valor), ',', '.'), '')::numeric from v where chave = 'estoque_teto_suspeito'), 10000)
$$;

create or replace function public.it_site_categoria(p_classe text)
returns text language sql immutable as $$
  select case
    when p_classe is null or btrim(p_classe) = '' or public.it_norm(p_classe) ~ 'nao cadastrad' then 'OUTROS'
    else regexp_replace(upper(btrim(p_classe)), '\s+', ' ', 'g')
  end
$$;

-- Catalogo do site. p_codigos != null devolve so esses (destaques), na ordem dada.
create or replace function public.it_site_catalogo(
  p_busca text default null,
  p_categoria text default null,
  p_limite integer default 24,
  p_offset integer default 0,
  p_codigos text[] default null,
  p_ordem text default 'relevancia'
)
returns table (codigo text, nome text, marca text, preco numeric, categoria text, foto_url text, total bigint)
language sql stable security definer
set search_path to 'public', 'extensions', 'pg_temp'
as $$
  with pol as (select * from public.it_site_politica()),
  ocultos as (
    select array_agg(upper(btrim(x))) a
    from regexp_split_to_table(coalesce((select valor from public.it_site_conteudo where chave = 'produtos_ocultos'), ''), '[,;\s]+') x
    where btrim(x) <> ''
  ),
  toks as (
    select array_agg(t) a from unnest(string_to_array(public.it_norm(coalesce(p_busca, '')), ' ')) t where t <> ''
  ),
  base as (
    select c.codigo, c.nome,
           case when public.it_norm(coalesce(c.marca, '')) ~ 'nao cadastrad' then null else c.marca end as marca,
           c.preco, public.it_site_categoria(p.classe) as categoria,
           case when c.tem_foto then p.foto_url end as foto_url,
           c.busca
    from pol, public.it_candidatos_v2(pol.filiais, pol.tabela, pol.minimo, pol.teto) c
    join public.it_produtos p on p.ordem = c.ordem
  ),
  filt as (
    select b.* from base b, toks, ocultos
    where (ocultos.a is null or not (upper(b.codigo) = any(ocultos.a)))
      and (p_codigos is null or b.codigo = any(p_codigos))
      and (p_categoria is null or p_categoria = '' or b.categoria = upper(p_categoria))
      and (toks.a is null or not exists (
            select 1 from unnest(toks.a) t where position(t in coalesce(b.busca, public.it_norm(b.nome))) = 0))
  )
  select f.codigo, f.nome, f.marca, f.preco, f.categoria, f.foto_url, count(*) over () as total
  from filt f
  order by
    case when p_codigos is not null then array_position(p_codigos, f.codigo) end,
    case when p_ordem = 'menor_preco' then f.preco end asc nulls last,
    case when p_ordem = 'maior_preco' then f.preco end desc nulls last,
    (f.foto_url is null), f.nome
  limit greatest(coalesce(p_limite, 24), 1) offset greatest(coalesce(p_offset, 0), 0)
$$;

create or replace function public.it_site_categorias()
returns table (categoria text, n bigint)
language sql stable security definer
set search_path to 'public', 'extensions', 'pg_temp'
as $$
  select categoria, count(*) from public.it_site_catalogo(null, null, 100000, 0, null) group by 1 order by 2 desc, 1
$$;

revoke all on function public.it_site_politica() from public, anon, authenticated;
revoke all on function public.it_site_catalogo(text, text, integer, integer, text[], text) from public, anon, authenticated;
revoke all on function public.it_site_categorias() from public, anon, authenticated;
grant execute on function public.it_site_politica() to service_role;
grant execute on function public.it_site_catalogo(text, text, integer, integer, text[], text) to service_role;
grant execute on function public.it_site_categorias() to service_role;
