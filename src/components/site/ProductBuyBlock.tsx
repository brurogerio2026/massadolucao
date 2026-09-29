import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/format";
import { priceOf, type Product } from "@/lib/store-queries";

export function ProductBuyBlock({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const min = Math.max(product.min_quantity ?? 1, 1);
  const [qty, setQty] = useState(min);
  const { current, original } = priceOf(product);
  const inStock = product.stock > 0;

  function addToCart() {
    if (!inStock) return;
    add(
      {
        productId: product.id,
        variantId: null,
        name: product.name,
        slug: product.slug,
        price: current,
        imageUrl: product.image_url,
        stock: product.stock,
      },
      qty,
    );
    toast.success("Produto adicionado ao carrinho");
  }

  return (
    <div>
      <div className="flex items-end gap-3">
        <p className="font-display text-4xl text-primary lg:text-5xl">{formatBRL(current)}</p>
        {original && (
          <span className="pb-1.5 text-sm text-muted-foreground line-through">
            {formatBRL(original)}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {inStock ? `Em estoque · ${product.stock} unidades disponíveis` : "Produto esgotado"}
        {product.sku ? ` · SKU ${product.sku}` : ""}
      </p>
      {product.shipping_info && (
        <p className="mt-1 text-sm text-muted-foreground">{product.shipping_info}</p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center overflow-hidden rounded-full bg-surface ring-1 ring-border">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            className="px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-strong"
            onClick={() => setQty((q) => Math.max(min, q - 1))}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            className="px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-strong"
            onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={!inStock}
          onClick={addToCart}
          className="rounded-full bg-surface px-6 py-2.5 text-sm font-semibold ring-1 ring-border transition-colors hover:bg-surface-strong disabled:opacity-40"
        >
          Adicionar ao carrinho
        </button>
        <button
          type="button"
          disabled={!inStock}
          onClick={() => {
            addToCart();
            setOpen(false);
            void navigate({ to: "/checkout" });
          }}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground ring-1 ring-primary/40 transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          COMPRAR AGORA
        </button>
      </div>
    </div>
  );
}
