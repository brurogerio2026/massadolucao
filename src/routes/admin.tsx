import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, Boxes, ClipboardList, CreditCard, FileImage, Gift, LogOut, PackagePlus, Settings, ShoppingBag, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getAdminData, getDashboardStats, saveProduct, deleteProduct, saveVariant, deleteVariant, updateOrder, deleteOrder, saveSettings, saveContent, deleteContent, uploadAdminAsset } from "@/lib/admin.functions";
import { disconnectMelhorEnvioConnection, getMelhorEnvioConnectionStatus, getMelhorEnvioConfigurationStatus, startMelhorEnvioOAuth } from "@/lib/melhor-envio.functions";
import { getMercadoPagoConnectionStatus, saveMercadoPagoCredentials, disconnectMercadoPagoConnection } from "@/lib/mercadopago.functions";
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
  const getStats = useServerFn(getDashboardStats);
  const [range, setRange] = useState({ startDate: "", endDate: "" });
  const statsQuery = useQuery({
    queryKey: ["admin-dashboard-stats", range.startDate, range.endDate],
    queryFn: () => getStats({ data: range.startDate || range.endDate ? range : {} }),
  });
  const stats = statsQuery.data ?? { totalOrders: 0, paidOrders: 0, pendingShipments: 0, shippedOrders: 0 };
  const paid = data.orders.filter((o: any) => o.payment_status === "approved");
  const revenue = paid.reduce((sum: number, o: any) => sum + Number(o.total), 0);
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const byDay = useMemo(() => {
    const points = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      points.set(d.toISOString().slice(0, 10), 0);
    }
    paid.forEach((o: any) => {
      const key = o.created_at.slice(0, 10);
      if (points.has(key)) points.set(key, (points.get(key) ?? 0) + Number(o.total));
    });
    return [...points].map(([date, total]) => ({ date: date.slice(5).split("-").reverse().join("/"), total }));
  }, [paid]);

  function setPreset(days: number | null) {
    if (days === null) {
      setRange({ startDate: "", endDate: "" });
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    setRange({ startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) });
  }

  return <><SectionHead title="Dashboard" description="Visão geral da operação e das vendas." />
    <div className="mb-5 rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Data inicial"><Input type="date" value={range.startDate} onChange={(e) => setRange((r) => ({ ...r, startDate: e.target.value }))} /></Field>
        <Field label="Data final"><Input type="date" value={range.endDate} onChange={(e) => setRange((r) => ({ ...r, endDate: e.target.value }))} /></Field>
        <Button type="button" variant="outline" onClick={() => setPreset(7)}>Últimos 7 dias</Button>
        <Button type="button" variant="outline" onClick={() => setPreset(30)}>Últimos 30 dias</Button>
        <Button type="button" variant="ghost" onClick={() => setPreset(null)}>Todo o período</Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Os indicadores consideram a data de criação do pedido. Envios pendentes = pedidos pagos/em preparação; enviados = enviados ou entregues.</p>
    </div>
    {statsQuery.isLoading ? <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted-foreground">Atualizando indicadores…</div> : statsQuery.error ? <div className="rounded-lg border border-destructive/30 bg-surface p-5 text-sm text-destructive">Não foi possível carregar os indicadores.</div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Total de pedidos" value={String(stats.totalOrders)} hint="pedidos no período" />
      <Stat label="Pedidos pagos" value={String(stats.paidOrders)} hint="pagamento aprovado" />
      <Stat label="Envios pendentes" value={String(stats.pendingShipments)} hint="pagos ou em preparação" />
      <Stat label="Pedidos enviados" value={String(stats.shippedOrders)} hint="enviados ou entregues" />
    </div>}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <Stat label="Faturamento total" value={formatBRL(revenue)} hint={`${paid.length} pagamentos aprovados carregados`} />
      <Stat label="Estoque baixo" value={String(data.products.filter((p: any) => p.stock <= 5).length)} hint={`${data.products.length} produtos cadastrados`} />
    </div>
    <div className="mt-5 rounded-lg border border-border bg-surface p-5"><h2 className="font-semibold">Faturamento dos últimos 7 dias</h2><div className="mt-5 h-72"><ResponsiveContainer width="100%" height="100%"><AreaChart data={byDay}><defs><linearGradient id="sales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.45}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" opacity={0.15}/><XAxis dataKey="date" fontSize={12}/><YAxis fontSize={12}/><Tooltip formatter={(value) => formatBRL(Number(value))}/><Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#sales)" /></AreaChart></ResponsiveContainer></div></div>
  </>;
}
