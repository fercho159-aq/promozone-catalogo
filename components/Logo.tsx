import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  /** onDark = header/footer navy; onLight = fondos claros */
  variant?: "onDark" | "onLight";
  /** oculta el tagline (util en barras muy compactas) */
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  href?: string | null;
  className?: string;
};

const SIZES = {
  sm: { mark: 32, text: "text-base", tag: "text-[0.45rem]" },
  md: { mark: 44, text: "text-xl sm:text-2xl", tag: "text-[0.5rem] sm:text-[0.6rem]" },
  lg: { mark: 64, text: "text-2xl sm:text-4xl", tag: "text-[0.6rem] sm:text-xs" },
};

export default function Logo({
  variant = "onDark",
  showTagline = true,
  size = "md",
  href = "/",
  className = "",
}: LogoProps) {
  const s = SIZES[size];
  const promo = variant === "onDark" ? "text-white" : "text-navy-800";
  // sobre navy el rojo de marca baja a 2.5:1, por eso se aclara
  const zone = variant === "onDark" ? "text-brand-onDark" : "text-brand-600";
  const tag = variant === "onDark" ? "text-navy-200" : "text-navy-500";

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/isotipo.png"
        alt=""
        width={s.mark}
        height={s.mark}
        priority
        className="shrink-0 drop-shadow-sm"
        style={{ width: s.mark, height: s.mark }}
      />
      <span className="flex flex-col leading-none">
        <span className={`font-display font-extrabold tracking-tight ${s.text}`}>
          <span className={promo}>PROMO</span>
          <span className={zone}>ZONE</span>
        </span>
        {showTagline && (
          // el tagline forma parte del logo: se muestra tambien en movil
          <span
            className={`mt-1 block whitespace-nowrap font-semibold uppercase tracking-[0.14em] sm:tracking-[0.18em] ${s.tag} ${tag}`}
          >
            Más que promocionales
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="PromoZone — Inicio" className="inline-flex">
      {content}
    </Link>
  );
}
