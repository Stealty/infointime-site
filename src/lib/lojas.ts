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
    whatsapp: null,
    telefone: null,
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
