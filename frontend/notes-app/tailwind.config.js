import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2B85FF",
        secondary: "#EF863E",
      },
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: "2.25rem",
              lineHeight: "2.5rem",
              fontWeight: "700",
            },
            h2: {
              fontSize: "1.875rem",
              lineHeight: "2.25rem",
              fontWeight: "600",
            },
            p: { fontSize: "1rem" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
