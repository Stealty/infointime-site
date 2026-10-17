import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center fundo-marca px-4 text-center text-white">
      <span className="faixa-curta" />
      <h1 className="mt-5 text-4xl font-extrabold">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-white/80">
        Se era um produto, ele pode ter acabado no estoque. Veja o que temos disponível agora.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/produtos" className="button button--lg button--danger">
          Ver produtos
        </Link>
        <Link href="/" className="button button--lg button--vidro">
          Página inicial
        </Link>
      </div>
    </main>
  );
}
