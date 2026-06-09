/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8F3FF",
          100: "#B9D8FF",
          200: "#8BBDFF",
          300: "#5CA2FF",
          400: "#2E87FF",
          500: "#165DFF",
          600: "#0E42D2",
          700: "#0A2BA3",
          800: "#061A74",
          900: "#030D45",
        },
        success: {
          50: "#E8FFEA",
          500: "#00B42A",
          600: "#009A29",
          700: "#008026",
        },
        warning: {
          50: "#FFF7E8",
          500: "#FF7D00",
          600: "#D96A00",
          700: "#B35700",
        },
        danger: {
          50: "#FFECE8",
          500: "#F53F3F",
          600: "#CB2634",
          700: "#A11229",
        },
        dark: {
          50: "#F7F8FA",
          100: "#E5E6EB",
          200: "#C9CDD4",
          300: "#86909C",
          400: "#4E5969",
          500: "#272E3B",
          600: "#1D2129",
          700: "#171A21",
          800: "#0F1218",
          900: "#0A0C10",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 4px 16px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.12)",
        "card-dark": "0 4px 16px rgba(0, 0, 0, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
