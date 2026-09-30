import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { shippingCartKey, type ShippingSelection } from "./shipping";

export type CartItem = {
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  remove: (productId: string, variantId?: string | null) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  shipping: ShippingSelection | null;
  setShipping: (shipping: ShippingSelection | null) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mdl-cart-v1";
const SHIPPING_STORAGE_KEY = "mdl-shipping-v1";

const sameLine = (a: CartItem, productId: string, variantId?: string | null) =>
  a.productId === productId && (a.variantId ?? null) === (variantId ?? null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [shipping, setShippingState] = useState<ShippingSelection | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
      const savedShipping = localStorage.getItem(SHIPPING_STORAGE_KEY);
      if (savedShipping) setShippingState(JSON.parse(savedShipping) as ShippingSelection);
    } catch {
      /* carrinho vazio */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignora */
    }
  }, [items]);

  const setShipping = useCallback((value: ShippingSelection | null) => { setShippingState(value); try { if (value) localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(value)); else localStorage.removeItem(SHIPPING_STORAGE_KEY); } catch { /* ignora */ } }, []);

  const add = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.variantId));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.variantId)
            ? { ...i, quantity: Math.min(i.quantity + quantity, Math.max(item.stock, 1)) }
            : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const setQuantity = useCallback(
    (productId: string, variantId: string | null | undefined, quantity: number) => {
      setItems((prev) =>
        prev
          .map((i) => (sameLine(i, productId, variantId) ? { ...i, quantity } : i))
          .filter((i) => i.quantity > 0),
      );
    },
    [],
  );

  const remove = useCallback((productId: string, variantId?: string | null) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, variantId)));
  }, []);

  const clear = useCallback(() => { setItems([]); setShipping(null); }, [setShipping]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const validShipping = shipping?.cartKey === shippingCartKey(items) ? shipping : null;
    return { items, count, subtotal, add, setQuantity, remove, clear, open, setOpen, shipping: validShipping, setShipping };
  }, [items, add, setQuantity, remove, clear, open, shipping, setShipping]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de CartProvider");
  return ctx;
}
