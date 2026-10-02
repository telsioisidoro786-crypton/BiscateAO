import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/como-funciona")({
  component: Como,
});

function Como() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-ink">
      <header>
        <h1 className="font-display text-2xl font-semibold">Como o BiscateAO trabalha</h1>
        <p className="mt-2 text-muted">
          Feito para o musseque e para o Kilamba. Telemóvel barato, WhatsApp, e
          gente que já faz o ofício.
        </p>
      </header>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Quem pede</h2>
        <p>
          Dizes o ofício, o bairro e o que se passou. Sem telefone no anúncio —
          isso fica para o WhatsApp, depois de aceitares um orçamento.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Quem faz</h2>
        <p>
          Os profissionais nesta versão são um recenseamento de Luanda para
          demonstrar o produto: ofício, bairro, preço em kwanzas, reputação.
          No dia a dia, o ofício entra pelo mesmo caminho.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Pagamento</h2>
        <p>
          O BiscateAO não segura o dinheiro. Combinas cash, Multicaixa Express
          ou Unitel Money, como já fazes com o vizinho.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-display text-lg font-semibold">Reputação</h2>
        <p>
          Estrelas e trabalhos feitos. Guardas quem te tratou bem. Da próxima
          fuga, não andas a perguntar no grupo da igreja.
        </p>
      </section>
      <Button asChild size="lg" className="w-full">
        <Link to="/pedir">Pedir um ofício</Link>
      </Button>
    </article>
  );
}
