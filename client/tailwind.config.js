// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: "#0a0f1c",
        neon: "#22d3ee",
        accent: "#ec4899",
      },
      fontFamily: {
        orbitron: ["Orbitron", "Rajdhani", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(34, 211, 238, 0.4)",
      },
    },
  },
  plugins: [],
};
