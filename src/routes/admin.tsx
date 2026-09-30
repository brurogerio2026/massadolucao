import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Boxes, ClipboardList, CreditCard, FileImage, Gift, LogOut, PackagePlus, Settings, ShoppingBag, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getAdminData, saveProduct, deleteProduct, saveVariant, deleteVariant, updateOrder, saveSettings, saveContent, deleteContent, uploadAdminAsset } from "@/lib/admin.functions";
import { disconnectMelhorEnvioConnection, getMelhorEnvioConnectionStatus, startMelhorEnvioOAuth } from "@/lib/melhor-envio.functions";
import { formatBRL, formatDateBR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return { user: null, isAdmin: false };
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    return { user: data.user, isAdmin: Boolean(isAdmin) };
  },
  head: () => ({ meta: [
    { title: "Painel administrativo — Massa do Lucão" },
    { name: "description", content: "Administração protegida da loja Massa do Lucão." },
    { property: "og:title", content: "Painel administrativo — Massa do Lucão" },
    { property: "og:description", content: "Administração protegida da loja Massa do Lucão." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminRoute,
});

type Product = Tables<"products">;
type Variant = Tables<"product_variants">;
type Order = Tables<"orders">;
type SettingsRow = Tables<"store_settings">;
type AdminData = Awaited<ReturnType<typeof getAdminData>>;
type ContentKind = "banners" | "testimonials" | "faqs" | "gallery_images" | "benefits" | "usage_steps" | "coupons";
type TabKey = "dashboard" | "products" | "orders" | "customers" | "payments" | "content" | "coupons" | "settings";

const navItems: { value: TabKey; label: string; icon: typeof BarChart3 }[] = [
  { value: "dashboard", label: "Dashboard", icon: BarChart3 }, { value: "products", label: "Produtos", icon: ShoppingBag },
  { value: "orders", label: "Pedidos", icon: ClipboardList }, { value: "customers", label: "Clientes", icon: Users },
  { value: "payments", label: "Pagamentos", icon: CreditCard }, { value: "content", label: "Conteúdo", icon: FileImage },
  { value: "coupons", label: "Cupons", icon: Gift }, { value: "settings", label: "Configurações", icon: Settings },
];

function AdminRoute() {
  const { user, isAdmin } = Route.useRouteContext();
  if (!user) return <AdminLogin />;
  if (!isAdmin) return <AccessDenied email={user.email ?? "esta conta"} />;
  return <AdminPanel email={user.email ?? "Administrador"} />;
}

function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget); const email = String(form.get("email") ?? ""); const password = String(form.get("password") ?? "");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (result.error) { toast.error(result.error.message); return; }
    if (mode === "signup" && !result.data.session) { toast.success("Confira seu e-mail para confirmar o acesso."); return; }
    await router.invalidate();
  }
  return <main className="grid min-h-screen place-items-center bg-background px-5 py-12">
    <div className="w-full max-w-md rounded-lg border border-border bg-surface p-7 shadow-2xl">
      <Link to="/" className="text-sm text-primary">← Voltar para a loja</Link>
      <p className="mt-8 text-xs font-semibold uppercase text-primary">Área restrita</p>
      <h1 className="mt-2 font-display text-4xl uppercase">Painel da loja</h1>
      <p className="mt-2 text-sm text-muted-foreground">Entre com a conta administrativa autorizada.</p>
      <form className="mt-7 space-y-4" onSubmit={submit}>
        <Field label="E-mail"><Input name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Senha"><Input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></Field>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar acesso"}</Button>
      </form>
      <Button variant="ghost" className="mt-3 w-full" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
        {mode === "login" ? "Criar primeiro acesso" : "Já tenho acesso"}
      </Button>
    </div>
  </main>;
}

function AccessDenied({ email }: { email: string }) {
  const router = useRouter();
  return <main className="grid min-h-screen place-items-center bg-background px-5"><div className="max-w-md text-center">
    <h1 className="font-display text-4xl uppercase">Acesso não autorizado</h1><p className="mt-3 text-sm text-muted-foreground">A conta {email} não possui permissão administrativa.</p>
    <Button className="mt-6" onClick={async () => { await supabase.auth.signOut(); await router.invalidate(); }}>Sair</Button>
  </div></main>;
}

function AdminPanel({ email }: { email: string }) {
  const queryClient = useQueryClient(); const router = useRouter(); const getData = useServerFn(getAdminData);
  const [tab, setTab] = useState<TabKey>("dashboard");
  const query = useQuery({ queryKey: ["admin-data"], queryFn: () => getData() });
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); await router.invalidate(); }
  if (query.isLoading) return <main className="grid min-h-screen place-items-center bg-background"><p className="text-sm text-muted-foreground">Carregando painel…</p></main>;
  if (query.error || !query.data) return <main className="grid min-h-screen place-items-center bg-background px-5"><div className="text-center"><p>Não foi possível carregar o painel.</p><Button className="mt-4" onClick={() => query.refetch()}>Tentar novamente</Button></div></main>;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-data"] });
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-surface"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 lg:px-7">
      <div><p className="font-display text-xl uppercase">Massa do Lucão</p><p className="text-xs text-muted-foreground">Administração da loja</p></div>
      <div className="flex items-center gap-3"><span className="hidden text-xs text-muted-foreground sm:inline">{email}</span><Button variant="outline" size="sm" onClick={signOut}><LogOut className="size-4" /> Sair</Button></div>
    </div></header>
    <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)} className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[210px_1fr] lg:px-7">
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 lg:flex-col lg:items-stretch">
        {navItems.map(({ value, label, icon: Icon }) => <TabsTrigger key={value} value={value} className="justify-start gap-2 px-3 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Icon className="size-4" />{label}</TabsTrigger>)}
        <Link to="/" className="mt-2 hidden px-3 py-2 text-sm text-muted-foreground hover:text-primary lg:block">Ver loja →</Link>
      </TabsList>
      <div className="min-w-0">
        <TabsContent value="dashboard"><Dashboard data={query.data} /></TabsContent>
        <TabsContent value="products"><Products data={query.data} refresh={refresh} /></TabsContent>
        <TabsContent value="orders"><Orders data={query.data} refresh={refresh} /></TabsContent>
        <TabsContent value="customers"><Customers data={query.data} /></TabsContent>
        <TabsContent value="payments"><Payments data={query.data} /></TabsContent>
        <TabsContent value="content"><ContentManager data={query.data} refresh={refresh} /></TabsContent>
        <TabsContent value="coupons"><Coupons data={query.data} refresh={refresh} /></TabsContent>
        <TabsContent value="settings"><StoreSettings settings={query.data.settings as SettingsRow | null} refresh={refresh} /></TabsContent>
      </div>
    </Tabs>
  </div>;
}

function SectionHead({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) { return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-3xl uppercase">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-sm"><span className="font-medium">{label}</span>{children}</label>; }
function Stat({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{hint}</p></div>; }

function Dashboard({ data }: { data: AdminData }) {
  const paid = data.orders.filter((o: any) => o.payment_status === "approved"); const revenue = paid.reduce((sum: number, o: any) => sum + Number(o.total), 0);
  const today = new Date().toISOString().slice(0, 10); const month = today.slice(0, 7);
  const byDay = useMemo(() => { const points = new Map<string, number>(); for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); points.set(d.toISOString().slice(0, 10), 0); } paid.forEach((o: any) => { const key = o.created_at.slice(0, 10); if (points.has(key)) points.set(key, (points.get(key) ?? 0) + Number(o.total)); }); return [...points].map(([date, total]) => ({ date: date.slice(5).split("-").reverse().join("/"), total })); }, [paid]);
  return <><SectionHead title="Dashboard" description="Visão geral da operação e das vendas." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Faturamento total" value={formatBRL(revenue)} hint={`${paid.length} pagamentos aprovados`} /><Stat label="Vendas hoje" value={String(data.orders.filter((o: any) => o.created_at.startsWith(today)).length)} hint="pedidos realizados" /><Stat label="Vendas no mês" value={String(data.orders.filter((o: any) => o.created_at.startsWith(month)).length)} hint="pedidos realizados" /><Stat label="Estoque baixo" value={String(data.products.filter((p: any) => p.stock <= 5).length)} hint={`${data.products.length} produtos cadastrados`} /></div>
    <div className="mt-5 rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Faturamento dos últimos 7 dias</h2><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={byDay}><defs><linearGradient id="sales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" opacity={0.15}/><XAxis dataKey="date" fontSize={12}/><YAxis fontSize={12}/><Tooltip formatter={(value) => formatBRL(Number(value))}/><Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#sales)" /></AreaChart></ResponsiveContainer></div></div>
  </>;
}

const emptyProduct = { name: "", slug: "", short_description: "", description: "", price: 0, sale_price: null, stock: 0, sku: null, weight_grams: null, package_width_cm: null, package_height_cm: null, package_length_cm: null, category: null, dimensions: null, shipping_info: "", usage_info: "", min_quantity: 1, image_url: null, gallery: [], benefits: [], is_active: true, sort_order: 0 };
function Products({ data, refresh }: { data: AdminData; refresh: () => void }) {
  const save = useServerFn(saveProduct); const remove = useServerFn(deleteProduct); const saveVar = useServerFn(saveVariant); const removeVar = useServerFn(deleteVariant); const upload = useServerFn(uploadAdminAsset);
  const [editing, setEditing] = useState<Partial<Product> | null>(null); const [variant, setVariant] = useState<Partial<Variant> | null>(null); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const f = new FormData(event.currentTarget); try { await save({ data: { id: editing?.id, name: String(f.get("name")), slug: String(f.get("slug")), short_description: String(f.get("short_description")), description: String(f.get("description")), price: Number(f.get("price")), sale_price: f.get("sale_price") ? Number(f.get("sale_price")) : null, stock: Number(f.get("stock")), sku: String(f.get("sku")) || null, weight_grams: f.get("weight_grams") ? Number(f.get("weight_grams")) : null, package_width_cm: f.get("package_width_cm") ? Number(f.get("package_width_cm")) : null, package_height_cm: f.get("package_height_cm") ? Number(f.get("package_height_cm")) : null, package_length_cm: f.get("package_length_cm") ? Number(f.get("package_length_cm")) : null, category: String(f.get("category")) || null, dimensions: String(f.get("dimensions")) || null, shipping_info: String(f.get("shipping_info")), usage_info: String(f.get("usage_info")), min_quantity: Number(f.get("min_quantity")), image_url: String(f.get("image_url")) || null, gallery: String(f.get("gallery") || "").split("\n").map(v => v.trim()).filter(Boolean), benefits: String(f.get("benefits") || "").split("\n").map(v => v.trim()).filter(Boolean), is_active: f.get("is_active") === "on", sort_order: Number(f.get("sort_order")) } }); toast.success("Produto salvo."); setEditing(null); refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar."); } finally { setBusy(false); } }
  async function submitVariant(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!variant?.product_id) return; const f = new FormData(event.currentTarget); try { await saveVar({ data: { id: variant.id, product_id: variant.product_id, name: String(f.get("name")), sku: String(f.get("sku")) || null, price: Number(f.get("price")), sale_price: f.get("sale_price") ? Number(f.get("sale_price")) : null, stock: Number(f.get("stock")), weight_grams: f.get("weight_grams") ? Number(f.get("weight_grams")) : null, is_active: f.get("is_active") === "on", sort_order: Number(f.get("sort_order")) } }); toast.success("Variação salva."); setVariant(null); refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar variação."); } }
  async function uploadProductImage(file: File, targetName: string) { if (file.size > 10_000_000) { toast.error("A imagem deve ter até 10 MB."); return; } const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.onerror = reject; reader.readAsDataURL(file); }); try { const result = await upload({ data: { name: file.name, type: file.type, base64 } }); const field = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${targetName}"]`); if (field) field.value = targetName === "gallery" && field.value ? `${field.value}\n${result.url}` : result.url; toast.success("Imagem enviada."); } catch { toast.error("Não foi possível enviar a imagem."); } }
  return <><SectionHead title="Produtos" description="Catálogo, estoque, imagens e variações." action={<Button onClick={() => setEditing(emptyProduct)}><PackagePlus className="size-4"/> Novo produto</Button>} />
    <div className="rounded-lg border border-border bg-surface"><Table><TableHeader><TableRow><TableHead>Produto</TableHead><TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{data.products.map((p: any) => <TableRow key={p.id}><TableCell><div className="flex items-center gap-3">{p.image_url ? <img src={p.image_url} alt="" className="size-11 rounded object-cover"/> : <div className="grid size-11 place-items-center rounded bg-muted"><Boxes className="size-5"/></div>}<div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.sku || p.slug}</p></div></div></TableCell><TableCell>{formatBRL(p.sale_price ?? p.price)}</TableCell><TableCell className={p.stock <= 5 ? "font-semibold text-destructive" : ""}>{p.stock}</TableCell><TableCell><Badge variant={p.is_active ? "default" : "secondary"}>{p.is_active ? "Ativo" : "Inativo"}</Badge></TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => setVariant({ product_id: p.id, name: "", price: p.price, sale_price: null, stock: 0, sku: null, weight_grams: null, is_active: true, sort_order: 0 })}>Variação</Button><Button size="sm" variant="ghost" onClick={() => setEditing(p)}>Editar</Button><Button size="sm" variant="ghost" onClick={async () => { if (!confirm("Excluir este produto?")) return; try { await remove({ data: { id: p.id } }); refresh(); } catch { toast.error("O produto possui pedidos ou variações vinculadas."); } }}>Excluir</Button></TableCell></TableRow>)}</TableBody></Table></div>
    <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto"><DialogHeader><DialogTitle>{editing?.id ? "Editar produto" : "Novo produto"}</DialogTitle><DialogDescription>Preencha somente informações reais e verificadas.</DialogDescription></DialogHeader>{editing && <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Field label="Nome"><Input name="name" defaultValue={editing.name ?? ""} required /></Field><Field label="URL amigável"><Input name="slug" defaultValue={editing.slug ?? ""} pattern="[a-z0-9-]+" required /></Field><Field label="Preço"><Input name="price" type="number" step="0.01" min="0" defaultValue={editing.price ?? 0} required /></Field><Field label="Preço promocional"><Input name="sale_price" type="number" step="0.01" min="0" defaultValue={editing.sale_price ?? ""} /></Field><Field label="Estoque"><Input name="stock" type="number" min="0" defaultValue={editing.stock ?? 0} required /></Field><Field label="Quantidade mínima"><Input name="min_quantity" type="number" min="1" defaultValue={editing.min_quantity ?? 1} required /></Field><Field label="SKU"><Input name="sku" defaultValue={editing.sku ?? ""} /></Field><Field label="Categoria"><Input name="category" defaultValue={editing.category ?? ""} /></Field><Field label="Peso da embalagem (g)"><Input name="weight_grams" type="number" min="1" defaultValue={editing.weight_grams ?? ""} /></Field><Field label="Dimensões descritivas"><Input name="dimensions" defaultValue={editing.dimensions ?? ""} /></Field><Field label="Largura da embalagem (cm)"><Input name="package_width_cm" type="number" min="0.1" step="0.1" defaultValue={editing.package_width_cm ?? ""} /></Field><Field label="Altura da embalagem (cm)"><Input name="package_height_cm" type="number" min="0.1" step="0.1" defaultValue={editing.package_height_cm ?? ""} /></Field><Field label="Comprimento da embalagem (cm)"><Input name="package_length_cm" type="number" min="0.1" step="0.1" defaultValue={editing.package_length_cm ?? ""} /></Field><div className="sm:col-span-2"><Field label="Descrição curta"><Textarea name="short_description" defaultValue={editing.short_description ?? ""}/></Field></div><div className="sm:col-span-2"><Field label="Descrição completa"><Textarea name="description" rows={5} defaultValue={editing.description ?? ""}/></Field></div><div className="sm:col-span-2"><Field label="Como usar"><Textarea name="usage_info" defaultValue={editing.usage_info ?? ""}/></Field></div><div className="sm:col-span-2"><Field label="Informações de envio"><Textarea name="shipping_info" defaultValue={editing.shipping_info ?? ""}/></Field></div><div className="sm:col-span-2 space-y-2"><Field label="Imagem principal"><Input name="image_url" defaultValue={editing.image_url ?? ""}/></Field><Input type="file" accept="image/*" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void uploadProductImage(file, "image_url"); }}/></div><div className="sm:col-span-2 space-y-2"><Field label="Galeria — uma imagem por linha"><Textarea name="gallery" defaultValue={Array.isArray(editing.gallery) ? editing.gallery.join("\n") : ""}/></Field><Input type="file" accept="image/*" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void uploadProductImage(file, "gallery"); }}/></div><div className="sm:col-span-2"><Field label="Benefícios — um por linha"><Textarea name="benefits" defaultValue={Array.isArray(editing.benefits) ? editing.benefits.join("\n") : ""}/></Field></div><Field label="Ordem"><Input name="sort_order" type="number" defaultValue={editing.sort_order ?? 0}/></Field><label className="flex items-center gap-2 self-end py-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={editing["is_active"] ?? true}/> Produto ativo</label><DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar produto"}</Button></DialogFooter></form>}</DialogContent></Dialog>
    <Dialog open={Boolean(variant)} onOpenChange={(open) => !open && setVariant(null)}><DialogContent><DialogHeader><DialogTitle>{variant?.id ? "Editar variação" : "Nova variação"}</DialogTitle></DialogHeader>{variant && <form onSubmit={submitVariant} className="grid gap-4 sm:grid-cols-2"><Field label="Nome"><Input name="name" defaultValue={variant.name ?? ""} required /></Field><Field label="SKU"><Input name="sku" defaultValue={variant.sku ?? ""}/></Field><Field label="Preço"><Input name="price" type="number" step="0.01" min="0" defaultValue={variant.price ?? 0}/></Field><Field label="Promoção"><Input name="sale_price" type="number" step="0.01" min="0" defaultValue={variant.sale_price ?? ""}/></Field><Field label="Estoque"><Input name="stock" type="number" min="0" defaultValue={variant.stock ?? 0}/></Field><Field label="Peso (g)"><Input name="weight_grams" type="number" min="0" defaultValue={variant.weight_grams ?? ""}/></Field><Field label="Ordem"><Input name="sort_order" type="number" defaultValue={variant.sort_order ?? 0}/></Field><label className="flex items-center gap-2 self-end py-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={variant.is_active ?? true}/> Ativa</label><DialogFooter className="sm:col-span-2"><Button type="submit">Salvar variação</Button></DialogFooter></form>}</DialogContent></Dialog>
    <div className="mt-6 rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Variações cadastradas</h2><div className="mt-3 space-y-2">{data.variants.map((v: any) => <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2 text-sm"><span>{data.products.find((p: any) => p.id === v.product_id)?.name} — <strong>{v.name}</strong> · {formatBRL(v.sale_price ?? v.price)} · {v.stock} un.</span><div><Button size="sm" variant="ghost" onClick={() => setVariant(v)}>Editar</Button><Button size="sm" variant="ghost" onClick={async () => { await removeVar({ data: { id: v.id } }); refresh(); }}>Excluir</Button></div></div>)}</div></div>
  </>;
}

const orderLabels: Record<string, string> = { awaiting_payment: "Aguardando pagamento", paid: "Pago", preparing: "Em preparação", shipped: "Enviado", delivered: "Entregue", cancelled: "Cancelado" };
function Orders({ data, refresh }: { data: AdminData; refresh: () => void }) { const mutate = useServerFn(updateOrder); const [editing, setEditing] = useState<Order | null>(null); async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!editing) return; const f = new FormData(event.currentTarget); try { await mutate({ data: { id: editing.id, order_status: String(f.get("order_status")) as any, tracking_code: String(f.get("tracking_code")) || null, notes: String(f.get("notes")) || null } }); toast.success("Pedido atualizado."); setEditing(null); refresh(); } catch { toast.error("Não foi possível atualizar."); } }
  return <><SectionHead title="Pedidos" description="Acompanhe pagamentos, separação e entregas."/><div className="rounded-lg border border-border bg-surface"><Table><TableHeader><TableRow><TableHead>Número</TableHead><TableHead>Cliente</TableHead><TableHead>Data</TableHead><TableHead>Total</TableHead><TableHead>Pagamento</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{data.orders.map((o: any) => <TableRow key={o.id} className="cursor-pointer" onClick={() => setEditing(o)}><TableCell>#{o.order_number}</TableCell><TableCell><p className="font-medium">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_phone}</p></TableCell><TableCell>{formatDateBR(o.created_at)}</TableCell><TableCell>{formatBRL(o.total)}</TableCell><TableCell><Badge variant={o.payment_status === "approved" ? "default" : "secondary"}>{o.payment_status}</Badge></TableCell><TableCell>{orderLabels[o.order_status] ?? o.order_status}</TableCell></TableRow>)}</TableBody></Table></div>
  <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Pedido #{editing?.order_number}</DialogTitle><DialogDescription>{editing?.customer_name} · {editing?.customer_email} · {editing?.customer_phone}</DialogDescription></DialogHeader>{editing && <form className="space-y-4" onSubmit={submit}><div className="rounded bg-muted p-3 text-sm"><p>{editing.street}, {editing.number} {editing.complement}</p><p>{editing.district} · {editing.city}/{editing.state} · CEP {editing.zip_code}</p></div><div className="space-y-1 rounded border border-border p-3">{data.orderItems.filter((i: any) => i.order_id === editing.id).map((i: any) => <p key={i.id} className="flex justify-between text-sm"><span>{i.quantity}× {i.product_name}</span><span>{formatBRL(i.total)}</span></p>)}</div><Field label="Status do pedido"><Select name="order_status" defaultValue={editing.order_status}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{Object.entries(orderLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field><Field label="Código de rastreio"><Input name="tracking_code" defaultValue={editing.tracking_code ?? ""}/></Field><Field label="Observações internas"><Textarea name="notes" defaultValue={editing.notes ?? ""}/></Field><DialogFooter><Button type="submit">Salvar alterações</Button></DialogFooter></form>}</DialogContent></Dialog></>;
}

function Customers({ data }: { data: AdminData }) { return <><SectionHead title="Clientes" description="Contatos cadastrados durante o checkout."/><div className="rounded-lg border border-border bg-surface"><Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Telefone</TableHead><TableHead>Pedidos</TableHead></TableRow></TableHeader><TableBody>{data.customers.map((c: any) => <TableRow key={c.id}><TableCell>{c.full_name}</TableCell><TableCell>{c.email}</TableCell><TableCell>{c.phone || "—"}</TableCell><TableCell>{data.orders.filter((o: any) => o.customer_id === c.id).length}</TableCell></TableRow>)}</TableBody></Table></div></>; }
function Payments({ data }: { data: AdminData }) { return <><SectionHead title="Pagamentos" description="Histórico retornado pelo provedor de pagamento."/><div className="rounded-lg border border-border bg-surface"><Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Provedor</TableHead><TableHead>Identificador</TableHead><TableHead>Status</TableHead><TableHead>Valor</TableHead></TableRow></TableHeader><TableBody>{data.payments.map((p: any) => <TableRow key={p.id}><TableCell>{formatDateBR(p.created_at)}</TableCell><TableCell>{p.provider}</TableCell><TableCell className="font-mono text-xs">{p.provider_payment_id || "—"}</TableCell><TableCell>{p.status || "—"}</TableCell><TableCell>{p.amount == null ? "—" : formatBRL(p.amount)}</TableCell></TableRow>)}</TableBody></Table></div></>; }

const contentConfig: Record<Exclude<ContentKind, "coupons">, { label: string; fields: { key: string; label: string; type?: "number" | "textarea" | "boolean"; required?: boolean }[] }> = {
  banners: { label: "Banners", fields: [{ key: "title", label: "Título" }, { key: "subtitle", label: "Subtítulo", type: "textarea" }, { key: "image_url", label: "Imagem desktop" }, { key: "mobile_image_url", label: "Imagem mobile" }, { key: "button_label", label: "Texto do botão" }, { key: "button_link", label: "Link" }, { key: "sort_order", label: "Ordem", type: "number" }, { key: "is_active", label: "Ativo", type: "boolean" }] },
  testimonials: { label: "Depoimentos", fields: [{ key: "name", label: "Nome", required: true }, { key: "location", label: "Local" }, { key: "message", label: "Depoimento", type: "textarea", required: true }, { key: "photo_url", label: "Foto" }, { key: "rating", label: "Nota (1 a 5)", type: "number" }, { key: "sort_order", label: "Ordem", type: "number" }, { key: "is_active", label: "Ativo", type: "boolean" }] },
  faqs: { label: "Perguntas frequentes", fields: [{ key: "question", label: "Pergunta", required: true }, { key: "answer", label: "Resposta", type: "textarea", required: true }, { key: "sort_order", label: "Ordem", type: "number" }, { key: "is_active", label: "Ativo", type: "boolean" }] },
  gallery_images: { label: "Galeria", fields: [{ key: "image_url", label: "Imagem", required: true }, { key: "caption", label: "Legenda" }, { key: "sort_order", label: "Ordem", type: "number" }, { key: "is_active", label: "Ativo", type: "boolean" }] },
  benefits: { label: "Benefícios", fields: [{ key: "title", label: "Título", required: true }, { key: "description", label: "Descrição", type: "textarea" }, { key: "icon", label: "Ícone" }, { key: "sort_order", label: "Ordem", type: "number" }, { key: "is_active", label: "Ativo", type: "boolean" }] },
  usage_steps: { label: "Como usar", fields: [{ key: "title", label: "Título", required: true }, { key: "description", label: "Descrição", type: "textarea" }, { key: "sort_order", label: "Ordem", type: "number" }, { key: "is_active", label: "Ativo", type: "boolean" }] },
};
function ContentManager({ data, refresh }: { data: AdminData; refresh: () => void }) { const save = useServerFn(saveContent); const remove = useServerFn(deleteContent); const [kind, setKind] = useState<Exclude<ContentKind, "coupons">>("banners"); const [editing, setEditing] = useState<Record<string, any> | null>(null); const config = contentConfig[kind]; const rows = (kind === "gallery_images" ? data.gallery : kind === "usage_steps" ? data.usageSteps : data[kind]) as any[];
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); const values: Record<string, string | number | boolean | null> = {}; config.fields.forEach(field => { const raw = f.get(field.key); values[field.key] = field.type === "boolean" ? raw === "on" : field.type === "number" ? Number(raw || 0) : String(raw || "") || null; }); try { await save({ data: { table: kind, id: editing?.["id"], values } }); toast.success("Conteúdo salvo."); setEditing(null); refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar."); } }
  return <><SectionHead title="Conteúdo" description="Banners, prova social e textos editáveis." action={<Button onClick={() => setEditing({ is_active: true, sort_order: rows.length })}>Adicionar</Button>}/><div className="mb-5 flex flex-wrap gap-2">{(Object.keys(contentConfig) as Exclude<ContentKind, "coupons">[]).map(key => <Button key={key} size="sm" variant={kind === key ? "default" : "outline"} onClick={() => setKind(key)}>{contentConfig[key].label}</Button>)}</div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rows.map(row => <div key={row.id} className="rounded-lg border border-border bg-surface p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{row.title || row.name || row.question || row.caption || "Imagem"}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.subtitle || row.message || row.answer || row.description || row.image_url}</p></div><Badge variant={row.is_active ? "default" : "secondary"}>{row.is_active ? "Ativo" : "Inativo"}</Badge></div><div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(row)}>Editar</Button><Button size="sm" variant="ghost" onClick={async () => { if (!confirm("Excluir este conteúdo?")) return; await remove({ data: { table: kind, id: row.id } }); refresh(); }}>Excluir</Button></div></div>)}</div><Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?.["id"] ? "Editar" : "Adicionar"} {config.label.toLowerCase()}</DialogTitle></DialogHeader>{editing && <form onSubmit={submit} className="space-y-4">{config.fields.map(field => field.type === "boolean" ? <label key={field.key} className="flex items-center gap-3 text-sm"><input type="checkbox" name={field.key} defaultChecked={editing[field.key] ?? true}/>{field.label}</label> : <Field key={field.key} label={field.label}>{field.type === "textarea" ? <Textarea name={field.key} defaultValue={editing[field.key] ?? ""} required={field.required}/> : <Input name={field.key} type={field.type ?? "text"} defaultValue={editing[field.key] ?? ""} required={field.required}/>}</Field>)}<DialogFooter><Button type="submit">Salvar</Button></DialogFooter></form>}</DialogContent></Dialog></>;
}

function Coupons({ data, refresh }: { data: AdminData; refresh: () => void }) { const save = useServerFn(saveContent); const remove = useServerFn(deleteContent); const [editing, setEditing] = useState<Record<string, any> | null>(null); async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); const values = { code: String(f.get("code")).trim().toUpperCase(), discount_percent: f.get("discount_percent") ? Number(f.get("discount_percent")) : null, discount_amount: f.get("discount_amount") ? Number(f.get("discount_amount")) : null, min_order_amount: Number(f.get("min_order_amount") || 0), starts_at: String(f.get("starts_at")) || null, expires_at: String(f.get("expires_at")) || null, usage_limit: f.get("usage_limit") ? Number(f.get("usage_limit")) : null, is_active: f.get("is_active") === "on" }; try { await save({ data: { table: "coupons", id: editing?.["id"], values } }); toast.success("Cupom salvo."); setEditing(null); refresh(); } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar cupom."); } }
  return <><SectionHead title="Cupons" description="Descontos com período, mínimo e limite de uso." action={<Button onClick={() => setEditing({ is_active: true })}>Novo cupom</Button>}/><div className="rounded-lg border border-border bg-surface"><Table><TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Desconto</TableHead><TableHead>Mínimo</TableHead><TableHead>Usos</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{data.coupons.map((c: any) => <TableRow key={c.id} className="cursor-pointer" onClick={() => setEditing(c)}><TableCell className="font-mono font-bold">{c.code}</TableCell><TableCell>{c.discount_percent ? `${c.discount_percent}%` : formatBRL(c.discount_amount || 0)}</TableCell><TableCell>{formatBRL(c.min_order_amount)}</TableCell><TableCell>{c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ""}</TableCell><TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Ativo" : "Inativo"}</Badge></TableCell></TableRow>)}</TableBody></Table></div><Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent><DialogHeader><DialogTitle>{editing?.["id"] ? "Editar cupom" : "Novo cupom"}</DialogTitle></DialogHeader>{editing && <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Field label="Código"><Input name="code" defaultValue={editing["code"] ?? ""} required/></Field><Field label="Pedido mínimo"><Input name="min_order_amount" type="number" min="0" step="0.01" defaultValue={editing["min_order_amount"] ?? 0}/></Field><Field label="Desconto percentual"><Input name="discount_percent" type="number" min="0" max="100" step="0.01" defaultValue={editing["discount_percent"] ?? ""}/></Field><Field label="Desconto fixo"><Input name="discount_amount" type="number" min="0" step="0.01" defaultValue={editing["discount_amount"] ?? ""}/></Field><Field label="Início"><Input name="starts_at" type="datetime-local" defaultValue={editing["starts_at"]?.slice(0,16) ?? ""}/></Field><Field label="Validade"><Input name="expires_at" type="datetime-local" defaultValue={editing["expires_at"]?.slice(0,16) ?? ""}/></Field><Field label="Limite de uso"><Input name="usage_limit" type="number" min="1" defaultValue={editing["usage_limit"] ?? ""}/></Field><label className="flex items-center gap-2 self-end py-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={editing["is_active"] ?? true}/> Ativo</label><DialogFooter className="sm:col-span-2"><Button type="button" variant="ghost" onClick={async () => { if (editing["id"]) { await remove({ data: { table: "coupons", id: String(editing["id"]) } }); setEditing(null); refresh(); } }}>Excluir</Button><Button type="submit">Salvar cupom</Button></DialogFooter></form>}</DialogContent></Dialog></>;
}

function StoreSettings({ settings, refresh }: { settings: SettingsRow | null; refresh: () => void }) {
  const save = useServerFn(saveSettings);
  const upload = useServerFn(uploadAdminAsset);
  const startOAuth = useServerFn(startMelhorEnvioOAuth);
  const disconnect = useServerFn(disconnectMelhorEnvioConnection);
  const getShippingStatus = useServerFn(getMelhorEnvioConnectionStatus);
  const [busy, setBusy] = useState(false);
  const [connectionBusy, setConnectionBusy] = useState(false);
  const connection = useQuery({ queryKey: ["melhor-envio-status"], queryFn: () => getShippingStatus(), staleTime: 30_000 });
  const currentSettings = settings;

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("melhor_envio");
    if (value === "connected") {
      toast.success("Melhor Envio conectado com sucesso.");
      connection.refetch();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (value === "error") {
      toast.error("Não foi possível conectar ao Melhor Envio. Confira o Client ID, Secret e callback.");
      connection.refetch();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!settings) return <p>Configurações não encontradas.</p>;

  async function connectMelhorEnvio() {
    setConnectionBusy(true);
    try {
      const result = await startOAuth();
      window.location.assign(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível iniciar a conexão.");
      setConnectionBusy(false);
    }
  }

  async function disconnectMelhorEnvio() {
    setConnectionBusy(true);
    try {
      await disconnect({ data: { confirm: true } });
      await connection.refetch();
      toast.success("Integração do Melhor Envio desconectada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível desconectar.");
    } finally {
      setConnectionBusy(false);
    }
  }

  async function uploadFile(file: File, input: HTMLInputElement) {
    if (file.size > 10_000_000) { toast.error("A imagem deve ter até 10 MB."); return; }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      const result = await upload({ data: { name: file.name, type: file.type, base64 } });
      const target = input.dataset["target"];
      const field = target ? document.querySelector<HTMLInputElement>(`input[name="${target}"]`) : null;
      if (field) field.value = result.url;
      toast.success("Imagem enviada.");
    } catch { toast.error("Não foi possível enviar a imagem."); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const f = new FormData(event.currentTarget);
    try {
      await save({ data: {
        id: currentSettings.id, store_name: String(f.get("store_name")), store_description: String(f.get("store_description")),
        whatsapp: String(f.get("whatsapp")) || null, whatsapp_message: String(f.get("whatsapp_message")), instagram: String(f.get("instagram")) || null,
        email: String(f.get("email")), address: String(f.get("address")) || null, logo_url: String(f.get("logo_url")) || null,
        favicon_url: String(f.get("favicon_url")) || null, about_title: String(f.get("about_title")), about_text: String(f.get("about_text")),
        about_image_url: String(f.get("about_image_url")) || null, flat_shipping_rate: Number(f.get("flat_shipping_rate")),
        free_shipping_enabled: f.get("free_shipping_enabled") === "on", free_shipping_min: f.get("free_shipping_min") ? Number(f.get("free_shipping_min")) : null,
        shipping_origin_zip: String(f.get("shipping_origin_zip")).replace(/\D/g, ""), privacy_policy: String(f.get("privacy_policy")), terms: String(f.get("terms"))
      }});
      toast.success("Configurações salvas."); refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar."); }
    finally { setBusy(false); }
  }

  const connected = connection.data?.connected === true;
  const statusLabel = connected ? "Conectado" : connection.data?.status === "error" ? "Reconexão necessária" : "Não conectado";

  return <><SectionHead title="Configurações" description="Identidade, contatos, frete e textos legais."/>
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Identidade da loja</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Nome da loja"><Input name="store_name" defaultValue={settings.store_name}/></Field><Field label="E-mail"><Input name="email" type="email" defaultValue={settings.email ?? ""}/></Field><div className="sm:col-span-2"><Field label="Descrição"><Textarea name="store_description" defaultValue={settings.store_description}/></Field></div><UploadField label="Logo" name="logo_url" value={settings.logo_url} onFile={uploadFile}/><UploadField label="Favicon" name="favicon_url" value={settings.favicon_url} onFile={uploadFile}/></div></section>
      <section className="rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Contato</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="WhatsApp"><Input name="whatsapp" defaultValue={settings.whatsapp ?? ""}/></Field><Field label="Instagram"><Input name="instagram" defaultValue={settings.instagram ?? ""}/></Field><Field label="Mensagem do WhatsApp"><Input name="whatsapp_message" defaultValue={settings.whatsapp_message}/></Field><Field label="Endereço"><Input name="address" defaultValue={settings.address ?? ""}/></Field></div></section>
      <section className="rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Sobre a massa</h2><div className="mt-4 grid gap-4"><Field label="Título"><Input name="about_title" defaultValue={settings.about_title}/></Field><Field label="Texto"><Textarea name="about_text" rows={6} defaultValue={settings.about_text}/></Field><UploadField label="Imagem" name="about_image_url" value={settings.about_image_url} onFile={uploadFile}/></div></section>
      <section className="rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Frete</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="CEP de origem"><Input name="shipping_origin_zip" inputMode="numeric" pattern="[0-9]{8}" defaultValue={settings.shipping_origin_zip}/></Field><Field label="Valor fixo"><Input name="flat_shipping_rate" type="number" min="0" step="0.01" defaultValue={settings.flat_shipping_rate}/></Field><Field label="Mínimo para frete grátis"><Input name="free_shipping_min" type="number" min="0" step="0.01" defaultValue={settings.free_shipping_min ?? ""}/></Field><label className="flex items-center gap-3 text-sm"><input name="free_shipping_enabled" type="checkbox" defaultChecked={settings.free_shipping_enabled}/> Ativar frete grátis</label></div></section>
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="font-semibold">Melhor Envio</h2><p className="mt-1 text-sm text-muted-foreground">Conecte a conta para cotar fretes com OAuth2. Os tokens ficam armazenados somente no servidor.</p></div>
          <Badge variant={connected ? "default" : "secondary"}>{statusLabel}</Badge>
        </div>
        {connection.data?.lastError && !connected && <p className="mt-3 text-sm text-destructive">{connection.data.lastError}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" onClick={connectMelhorEnvio} disabled={connectionBusy || connection.isLoading}>{connected ? "Reconectar Melhor Envio" : "Conectar Melhor Envio"}</Button>
          {connected && <Button type="button" variant="outline" onClick={disconnectMelhorEnvio} disabled={connectionBusy}>Desconectar</Button>}
        </div>
        {connection.data?.expiresAt && connected && <p className="mt-3 text-xs text-muted-foreground">O acesso é renovado automaticamente antes de expirar.</p>}
      </section>
      <section className="rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Textos legais</h2><div className="mt-4 grid gap-4"><Field label="Política de privacidade"><Textarea name="privacy_policy" rows={7} defaultValue={settings.privacy_policy}/></Field><Field label="Termos"><Textarea name="terms" rows={7} defaultValue={settings.terms}/></Field></div></section>
      <Button type="submit" disabled={busy}>{busy ? "Salvando…" : "Salvar configurações"}</Button>
    </form>
  </>;
}
function UploadField({ label, name, value, onFile }: { label: string; name: string; value: string | null; onFile: (file: File, input: HTMLInputElement) => void }) { return <div className="space-y-2"><Field label={label}><Input name={name} defaultValue={value ?? ""}/></Field><Input type="file" accept="image/*" data-target={name} onChange={(e) => { const file = e.currentTarget.files?.[0]; if (file) onFile(file, e.currentTarget); }}/></div>; }
