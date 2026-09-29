import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type StoreSettings = Tables<"store_settings">;
export type Product = Tables<"products">;
export type Testimonial = Tables<"testimonials">;
export type Faq = Tables<"faqs">;
export type GalleryImage = Tables<"gallery_images">;
export type Banner = Tables<"banners">;
export type UsageStep = Tables<"usage_steps">;
export type Benefit = Tables<"benefits">;

export const settingsQuery = queryOptions({
  queryKey: ["store_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("store_settings").select("*").limit(1).maybeSingle();
    if (error) throw error;
    return data as StoreSettings | null;
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products", "active"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as Product[];
  },
});

export const productBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Testimonial[];
  },
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Faq[];
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as GalleryImage[];
  },
});

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Banner[];
  },
});

export const usageStepsQuery = queryOptions({
  queryKey: ["usage_steps"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("usage_steps")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as UsageStep[];
  },
});

export const benefitsQuery = queryOptions({
  queryKey: ["benefits"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("benefits")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data as Benefit[];
  },
});

export function priceOf(p: { price: number | string; sale_price: number | string | null }) {
  const price = Number(p.price);
  const sale = p.sale_price == null ? null : Number(p.sale_price);
  return { current: sale && sale > 0 ? sale : price, original: sale && sale > 0 ? price : null };
}
