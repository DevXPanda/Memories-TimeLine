/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts}",
  ],
  theme: {
    screens: {
      xs: "390px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans:  ["'DM Sans'", "system-ui", "sans-serif"],
        script:["'Dancing Script'", "cursive"],
      },
      colors: {
        cream: { 50: "#fffbf7", 100: "#fef3e2", 200: "#fde8c8" },
      },
      animation: {
        heartbeat: "heartbeat 1.6s ease-in-out infinite",
        float:     "float 5s ease-in-out infinite",
        shimmer:   "shimmer 1.6s infinite",
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "ping-once":"ping-once 0.6s ease-out forwards",
      },
      boxShadow: {
        rose: "0 4px 28px rgba(244,63,94,0.14)",
        "rose-lg": "0 10px 55px rgba(244,63,94,0.20)",
      },
    },
  },
  plugins: [],
};
