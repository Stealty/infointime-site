// Dados das lojas, copiados do site atual (infointime.com.br). Mudou endereco ou
// telefone? E so editar aqui.
export const LOJAS = [
  {
    nome: "Volta Redonda",
    endereco: "Av. Amaral Peixoto, 59 - Centro",
    cidade: "Volta Redonda / RJ",
    whatsapp: "5524988138858",
    telefone: "(24) 98813-8858",
    mapa: "https://www.google.com/maps/search/?api=1&query=Info+In+Time+Av.+Amaral+Peixoto+59+Volta+Redonda",
  },
  {
    nome: "Barra Mansa",
    endereco: "Av. Domingos Mariano, 6 - Centro",
    cidade: "Barra Mansa / RJ",
    whatsapp: "5524988136426",
    telefone: "(24) 98813-6426",
    mapa: "https://www.google.com/maps/search/?api=1&query=Info+In+Time+Av.+Domingos+Mariano+6+Barra+Mansa",
  },
  {
    nome: "Arrozal",
    endereco: "Praça - R. São João, 37",
    cidade: "Arrozal, Piraí / RJ",
    whatsapp: "5524988135546",
    telefone: "(24) 98813-5546",
    mapa: "https://www.google.com/maps/search/?api=1&query=Info+In+Time+R.+S%C3%A3o+Jo%C3%A3o+37+Arrozal+Pira%C3%AD",
  },
] as const;

export const HORARIO = [
  { dias: "Segunda a sexta", horas: "8h30 às 18h30" },
  { dias: "Sábado", horas: "8h às 13h" },
];

export const REDES = {
  instagram: "https://www.instagram.com/infointime/",
  facebook: "https://www.facebook.com/infointime/",
};

// Atributos dos botoes gerais de WhatsApp (os que abrem a janela "Qual loja fica
// mais perto de você?", ver EscolherLoja). O link NAO leva numero de loja: o GTM
// do gestor conta a conversao de Volta Redonda por "clique em link com o numero
// de VR no endereco", entao um link geral com esse numero contava todo clique
// como VR, mesmo quando a pessoa escolhia outra loja. A conversao agora so
// acontece no link da loja escolhida, dentro da janela. Sem JavaScript o botao
// leva para a lista de lojas da home, cada uma com o seu WhatsApp.
export function escolherLoja(texto: string) {
  return { href: "/#lojas", "data-escolher-loja": texto };
}

// Endereco completo da pagina do produto, para ir dentro das mensagens de
// WhatsApp: o WhatsApp so monta a previa com a foto quando o link e absoluto.
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://infointime.com.br").replace(/\/$/, "");
export function linkProduto(codigo: string) {
  return `${SITE}/produtos/${encodeURIComponent(codigo)}`;
}
