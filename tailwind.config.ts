import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // FIX 1: xs breakpoint added so xs:px-4, xs:h-[170px] etc. in globals.css compile correctly
      screens: {
        xs: "360px",
      },
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          500:        "#fff498",
          600:        "#e6dc00",
        },

        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        brand: {
          DEFAULT: "hsl(var(--brand))",
          dark:    "hsl(var(--brand-dark))",
          text:    "hsl(var(--brand-text))",
          light:   "#fffef0",
        },

        fill:         { 1: "hsl(var(--brand))" },
        bankGradient: "hsl(var(--brand))",

        black: {
          DEFAULT: "#1a1a1a",
          1:       "#1a1a1a",
          2:       "#2a2a2a",
        },

        cream: {
          DEFAULT: "#fffef0",
          50:      "#fffef0",
          100:     "#fffde0",
        },

        success: {
          25:  "#F6FEF9",
          50:  "#ECFDF3",
          100: "#D1FADF",
          500: "#12B76A",
          600: "#039855",
          700: "#027A48",
          900: "#054F31",
        },

        danger: {
          25:  "#FFFBFA",
          50:  "#FEF3F2",
          100: "#FEE4E2",
          500: "#F04438",
          600: "#D92D20",
          700: "#B42318",
          900: "#7A271A",
        },

        gray: {
          25:  "#FCFCFD",
          100: "#F2F4F7",
          200: "#EAECF0",
          300: "#D0D5DD",
          400: "#98A2B3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1D2939",
          900: "#101828",
        },

        sky: { 1: "#fffef0" },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      backgroundImage: {
        "primary-gradient":    "linear-gradient(90deg, #fff498 0%, #e6dc00 100%)",
        "bank-gradient":       "linear-gradient(90deg, #fff498 0%, #fffef0 100%)",
        "bank-green-gradient": "linear-gradient(90deg, #027A48 0%, #039855 100%)",
      },

      boxShadow: {
        form:       "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        chart:      "0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)",
        profile:    "0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)",
        creditCard: "8px 10px 16px 0px rgba(0, 0, 0, 0.05)",
      },

      fontFamily: {
        inter:            ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        "ibm-plex-serif": ["var(--font-ibm-plex-serif)", "IBM Plex Serif", "ui-serif", "Georgia", "serif"],
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;