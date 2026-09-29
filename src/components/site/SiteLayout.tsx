import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { WhatsAppButton } from "./WhatsAppButton";
import { MobileBuyBar } from "./MobileBuyBar";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 drift opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[70vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--secondary)_55%,transparent),transparent_60%)]"
        aria-hidden
      />
      <div className="relative z-10 pb-24 md:pb-0">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
      <CartDrawer />
      <WhatsAppButton />
      <MobileBuyBar />
    </div>
  );
}
