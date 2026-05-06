import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#05070f",
        surface: "#0b1020",
        panel: "#0f1629",
        border: "rgba(148, 163, 184, 0.18)",
        line: "#38bdf8",
        glow: "#5f7cff",
        accent: "#22d3ee",
        success: "#34d399",
        warning: "#fbbf24",
      },
      boxShadow: {
        glow: "0 0 24px rgba(56, 189, 248, 0.22)",
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
