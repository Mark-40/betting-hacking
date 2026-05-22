import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#05060B",
          800: "#0A0C18",
          700: "#0F1224",
          600: "#171A30",
          500: "#222641",
        },
        neon: {
          cyan: "#22D3EE",
          violet: "#A855F7",
          magenta: "#EC4899",
          lime: "#A3E635",
          gold: "#FBBF24",
        },
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(168, 85, 247, 0.35)",
        cyan: "0 0 24px rgba(34, 211, 238, 0.35)",
        magenta: "0 0 24px rgba(236, 72, 153, 0.35)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 80%)",
        "radial-violet":
          "radial-gradient(800px circle at 20% -10%, rgba(168,85,247,0.18), transparent 40%), radial-gradient(800px circle at 80% 110%, rgba(34,211,238,0.18), transparent 40%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
