/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6DC010", // Verde lima
          light: "#F0FAE0",
        },
        secondary: {
          DEFAULT: "#F47920", // Naranja
          light: "#FAA74A",
        },
        accent: "#F47920",
        background: "#FFFFFF",
        card: "#F5F5F5",
        text: {
          DEFAULT: "#1A1A1A",
          muted: "#4B5563",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
}
