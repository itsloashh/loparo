import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#FFFFFF", warm: "#F7F6F2", dark: "#0E0E0D", "dark-warm": "#161614" },
        border: { DEFAULT: "#E0DDD6", dark: "#2A2A26" },
        txt: { DEFAULT: "#141413", mid: "#3D3D38", muted: "#6B6B62", dark: "#E8E6E0", "dark-mid": "#B8B5AC", "dark-muted": "#7A776E" },
        green: { DEFAULT: "#006039", light: "rgba(0,96,57,0.07)", bright: "#00A86B", "bright-light": "rgba(0,168,107,0.08)" },
        gold: { DEFAULT: "#A37E2C", light: "rgba(163,126,44,0.08)", bright: "#D4A843" },
        inv: { bg: "#141413", text: "#F0EDE6", muted: "#9E9D96" },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Libre Franklin", "sans-serif"],
      },
      keyframes: {
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "reveal-up": "reveal-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
