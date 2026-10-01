import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { lookupCustomerOrders } from "@/lib/checkout.functions";
import { formatDateBR } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/acompanhar-pedido")({
  head: () => ({
    meta: [
      { title: "Acompanhe seu pedido — Massa do Lucão" },
      { name: "description", content: "Consulte o andamento do seu pedido." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackOrderPage,
});

const paymentLabels: Record<string, string> = {
  pending: "Aguardando pagamento",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
  cancelled: "Pagamento cancelado",
  refunded: "Pagamento estornado",
};
const statusLabels: Record<string, string> = {
  awaiting_payment: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  preparing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

function TrackOrderPage() {
  const lookup = useServerFn(lookupCustomerOrders);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Array<{
    order_number: number;
    payment_status: string;
    order_status: string;
    tracking_code: string | null;
    created_at: string;
  }> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrders(null);
    try {
      const result = await lookup({ data: { cpf: cpf.replace(/\D/g, ""), email: email.trim() } });
      setOrders(result as typeof orders);
    } catch {
      setError("Não foi possível consultar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-4xl uppercase">Acompanhe seu pedido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informe o CPF e o e-mail usados na compra para consultar o andamento dos seus pedidos.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-2xl bg-surface p-5 ring-1 ring-border sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-muted-foreground">CPF</span>
            <input
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              maxLength={18}
              required
              className="mt-1 w-full rounded-xl bg-background px-3 py-2 ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">E-mail da compra</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="seu@email.com"
              required
              className="mt-1 w-full rounded-xl bg-background px-3 py-2 ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading || cpf.replace(/\D/g, "").length !== 11 || !email.trim()} className="rounded-full px-6">
              {loading ? "Consultando…" : "Consultar pedido"}
            </Button>
          </div>
        </form>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        {orders && orders.length === 0 && (
          <p className="mt-5 rounded-xl bg-surface p-4 text-sm text-muted-foreground ring-1 ring-border">
            Não encontramos pedidos com esses dados. Confira o CPF e o e-mail informados na compra.
          </p>
        )}
        {orders && orders.length > 0 && (
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <article key={order.order_number} className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl uppercase">Pedido #{order.order_number}</h2>
                  <span className="text-xs text-muted-foreground">{formatDateBR(order.created_at)}</span>
                </div>
                <p className="mt-3 text-sm">
                  Pagamento: <strong>{paymentLabels[order.payment_status] ?? order.payment_status}</strong>
                </p>
                <p className="mt-1 text-sm">
                  Andamento: <strong className="text-primary">{statusLabels[order.order_status] ?? order.order_status}</strong>
                </p>
                {order.tracking_code && (
                  <p className="mt-2 break-all text-sm">
                    Código de rastreio: <strong>{order.tracking_code}</strong>
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
