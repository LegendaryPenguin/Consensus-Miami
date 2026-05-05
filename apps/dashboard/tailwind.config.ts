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
        panel: "#0d1224",
        line: "#2ee6ff",
        glow: "#5f7cff",
      },
      boxShadow: {
        glow: "0 0 35px rgba(95, 124, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
