import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/store-queries";

export function Logo({ compact = false }: { compact?: boolean }) {
  const { data: settings } = useQuery(settingsQuery);
  const name = settings?.store_name ?? "Massa do Lucão";

  return (
    <Link to="/" className="flex items-center gap-2.5">
      {settings?.logo_url ? (
        <img
          src={settings.logo_url}
          alt={name}
          className="h-9 w-auto max-w-[180px] object-contain"
        />
      ) : (
        <>
          <span className="grid size-8 place-items-center rounded-md bg-primary font-display text-lg text-primary-foreground">
            L
          </span>
          <span
            className={`font-display tracking-wide ${compact ? "text-base" : "text-lg sm:text-xl"} uppercase`}
          >
            {name}
          </span>
        </>
      )}
    </Link>
  );
}
