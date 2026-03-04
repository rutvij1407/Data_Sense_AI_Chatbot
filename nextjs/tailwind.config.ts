import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: "#dc143c",
          dark: "#b01030",
          light: "#ff4757",
          pale: "#ff6b6b",
          muted: "#ff8e8e",
        },
        surface: {
          base: "#0a0a0a",
          raised: "#111827",
          overlay: "#1a1a2e",
          panel: "#16213e",
        },
        border: {
          subtle: "#2a2a2a",
          accent: "#dc143c",
        },
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        "gradient-sidebar": "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        "gradient-crimson": "linear-gradient(90deg, #dc143c 0%, #ff4757 100%)",
        "gradient-card": "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      },
      boxShadow: {
        crimson: "0 4px 15px rgba(220, 20, 60, 0.4)",
        "crimson-lg": "0 6px 25px rgba(220, 20, 60, 0.6)",
        card: "0 4px 15px rgba(220, 20, 60, 0.15)",
      },
      animation: {
        "pulse-crimson": "pulse-crimson 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-in",
      },
      keyframes: {
        "pulse-crimson": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-up": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
