import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F8FAFC",
        surface: "#FFFFFF",
        raised: "#F1F5F9",
        mutedSurface: "#F3F4F6",
        hairline: "#E2E8F0",
        hairlineStrong: "#CBD5E1",
        ink: "#0F172A",
        muted: "#64748B",
        mutedDeep: "#475569",
        accent: "#2563EB",
        accentPress: "#1D4ED8",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        link: "#0284C7",
        linkHover: "#0369A1",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.10)",
      },
      borderRadius: {
        panel: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
