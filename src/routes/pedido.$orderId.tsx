import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { getOrderStatus } from "@/lib/checkout.functions";
import { formatBRL, formatDateBR } from "@/lib/format";

export const Route = createFileRoute("/pedido/$orderId")({
  head: () => ({
    meta: [
      { title: "Seu pedido — Massa do Lucão" },
      { name: "description", content: "Acompanhe o status do seu pedido da Massa do Lucão." },
      { property: "og:title", content: "Seu pedido — Massa do Lucão" },
      { property: "og:description", content: "Status do pedido." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

const paymentLabels: Record<string, string> = {
  pending: "Aguardando pagamento",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
  cancelled: "Pagamento cancelado",
  refunded: "Pagamento estornado",
};

const orderLabels: Record<string, string> = {
  awaiting_payment: "Aguardando pagamento",
  paid: "Pago",
  preparing: "Em preparação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

function OrderPage() {
  const { orderId } = Route.useParams();
  const fetchOrder = useServerFn(getOrderStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrder({ data: { orderId } }),
    refetchInterval: 15000,
  });

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-4xl uppercase">Seu pedido</h1>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && !data && (
          <p className="mt-4 text-sm text-muted-foreground">Pedido não encontrado.</p>
        )}
        {data && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
              <p className="font-display text-2xl">Pedido #{data.order.order_number}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateBR(data.order.created_at)}
              </p>
              <p className="mt-3 text-sm">
                Pagamento:{" "}
                <span className="font-semibold text-primary">
                  {paymentLabels[data.order.payment_status] ?? data.order.payment_status}
                </span>
              </p>
              <p className="text-sm">
                Pedido:{" "}
                <span className="font-semibold">
                  {orderLabels[data.order.order_status] ?? data.order.order_status}
                </span>
              </p>
              {data.order.tracking_code && (
                <p className="mt-1 text-sm">Rastreio: {data.order.tracking_code}</p>
              )}
            </div>

            <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
              {data.items.map((i, idx) => (
                <div key={idx} className="flex justify-between py-1 text-sm text-muted-foreground">
                  <span>
                    {i.quantity}× {i.product_name}
                  </span>
                  <span>{formatBRL(i.total)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatBRL(data.order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
