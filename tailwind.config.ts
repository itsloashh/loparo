import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#060911", card: "#0C1019", hover: "#111620", nav: "rgba(6,9,17,0.85)" },
        line: { DEFAULT: "rgba(255,255,255,0.06)", bright: "rgba(255,255,255,0.1)", gold: "rgba(212,168,67,0.2)" },
        txt: { DEFAULT: "#E8E6E0", mid: "#9B98A0", muted: "#5C5A64" },
        gold: { DEFAULT: "#D4A843", bright: "#F0D078", dim: "#A37E2C" },
        accent: { purple: "#7B61FF", pink: "#FF61D8", teal: "#51FAAA" },
      },
      fontFamily: { sans: ["'Libre Franklin'", "system-ui", "sans-serif"], serif: ["'Cormorant Garamond'", "serif"] },
      borderRadius: { xl: "16px", "2xl": "20px", "3xl": "24px" },
      boxShadow: {
        glow: "0 0 30px rgba(212,168,67,0.15)", "glow-lg": "0 0 60px rgba(212,168,67,0.2)",
        "glow-card": "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
