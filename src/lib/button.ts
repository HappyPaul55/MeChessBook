/**
 * Button class names, shared by `Button.astro` and the React island.
 *
 * These are the exact styles used by the main happypaul55.com build, so the
 * tool's buttons match the rest of the microsites.
 */

export type ButtonVariant = "primary" | "outline" | "outlineInk";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[6px] px-[1.2rem] py-[0.8rem] font-mono text-[0.76rem] font-bold uppercase tracking-[0.1em] transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-brand";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-ink bg-yellow text-ink shadow-[4px_4px_0_0_var(--color-ink)] hover:-translate-y-0.5 hover:bg-yellow-deep hover:shadow-[6px_6px_0_0_var(--color-ink)]",
  outline:
    "border border-line-strong text-ink hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-cream",
  outlineInk:
    "border border-line-ink-strong text-cream hover:-translate-y-0.5 hover:border-yellow hover:bg-yellow hover:text-ink",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  extra = "",
): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}
