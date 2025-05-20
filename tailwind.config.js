/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#337037",
        primaryDark: "#285A2C",
        primaryLight: "#D2E4D3",
        accent: "#89C47E",
        warning: "#FFD700",
        error: "#FF4D4F",
        success: "#4CAF50",
        textPrimary: "#1F1F1F",
        textSecondary: "#666666",
        textDisabled: "#BFBFBF",
        background: "#FFFFFF",
        card: "#FAFAFA",
        divider: "#E0E0E0",
        tabInactive: "#A0A0A0",
      },
    },
  },
  plugins: [],
};
