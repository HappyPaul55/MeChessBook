const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      font: {
        anton: ["Anton", ...fontFamily.sans],
      },
      colors: {
        brand: "#9d2426",
      },
      width: {
        a2: "420mm",
        a3: "297mm",
        a4: "210mm",
        a5: "148mm",
      },
      height: {
        a4: "297mm",
        a5: "210mm",
      },
      padding: {
        "7.5": "1.875rem",
      },
      fontFamily: {
        "card": "Anton",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
