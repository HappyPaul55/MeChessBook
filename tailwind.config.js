// Kept as a Tailwind config rather than folded fully into `@theme`, because the
// book was authored against these `w-a4` / `h-a5` utilities. Loading it through
// `@config` reproduces the exact utility set the printed pages rely on.
//
// `font.anton` is intentionally left in an unrecognised namespace: it matches
// the original build, where `font-anton` produced no rule, so the book's text
// renders identically. Do not "fix" it without re-checking the printed book.
export default {
  content: ["./src/**/*.{astro,ts,tsx}"],
  theme: {
    extend: {
      font: {
        anton: ["Anton", "sans-serif"],
      },
      colors: {
        brand: "#9d2426",
      },
      width: {
        a2: "420mm",
        a3: "297mm",
        a4: "210mm",
        a5: "148mm",
      },
      height: {
        a4: "297mm",
        a5: "210mm",
      },
      padding: {
        7.5: "1.875rem",
      },
      fontFamily: {
        card: "Anton",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
