/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          900: "#07090f",
          850: "#0a0d13",
          800: "#0c1018",
          700: "#11161f",
        },
        brand: {
          cyan: "#22d3ee",
          blue: "#60a5fa",
          violet: "#a78bfa",
          amber: "#fbbf24",
        },
      },
      backgroundImage: {
        "brand-grad": "linear-gradient(95deg,#22d3ee,#60a5fa 55%,#a78bfa)",
      },
      boxShadow: {
        glow: "0 8px 40px rgba(34,211,238,.25)",
        card: "0 18px 50px rgba(0,0,0,.45)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        fadeUp: { from: { opacity: 0, transform: "translateY(14px)" }, to: { opacity: 1, transform: "none" } },
      },
      animation: {
        floaty: "floaty 7s ease-in-out infinite",
        fadeUp: "fadeUp .6s ease both",
      },
    },
  },
  plugins: [],
};
