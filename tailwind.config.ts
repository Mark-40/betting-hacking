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
          950: "#030410",
          900: "#05060B",
          850: "#080A18",
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
          rose: "#FB7185",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "Segoe UI", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        glow: "0 0 32px rgba(168, 85, 247, 0.45), 0 0 80px rgba(168, 85, 247, 0.18)",
        cyan: "0 0 32px rgba(34, 211, 238, 0.45), 0 0 80px rgba(34, 211, 238, 0.18)",
        magenta: "0 0 32px rgba(236, 72, 153, 0.45), 0 0 80px rgba(236, 72, 153, 0.18)",
        innerGlow: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)",
        elevated: "0 20px 50px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 80%)",
        "mesh-violet":
          "radial-gradient(900px circle at 15% 0%, rgba(168,85,247,0.22), transparent 45%), radial-gradient(900px circle at 85% 110%, rgba(34,211,238,0.18), transparent 45%), radial-gradient(700px circle at 50% 50%, rgba(236,72,153,0.10), transparent 60%)",
        "hairline":
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "grid-drift": "gridDrift 40s linear infinite",
        "aurora": "aurora 18s ease-in-out infinite alternate",
        "ticker": "ticker 40s linear infinite",
        "ticker-slow": "ticker 80s linear infinite",
        "glow-pulse": "glowPulse 2.4s ease-in-out infinite",
        "rank-pop": "rankPop 0.6s cubic-bezier(0.22,1,0.36,1)",
        "scanline": "scanline 6s linear infinite",
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
        gridDrift: {
          "0%": { backgroundPosition: "0px 0px, 0px 0px" },
          "100%": { backgroundPosition: "560px 0px, 0px 560px" },
        },
        aurora: {
          "0%": { transform: "translate3d(-4%, -2%, 0) scale(1)", opacity: "0.7" },
          "50%": { transform: "translate3d(3%, 2%, 0) scale(1.08)", opacity: "1" },
          "100%": { transform: "translate3d(-2%, 3%, 0) scale(1.04)", opacity: "0.85" },
        },
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.55", filter: "blur(18px)" },
          "50%": { opacity: "1", filter: "blur(22px)" },
        },
        rankPop: {
          "0%": { transform: "scale(0.94)", filter: "brightness(1.6)" },
          "60%": { transform: "scale(1.03)", filter: "brightness(1.2)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
