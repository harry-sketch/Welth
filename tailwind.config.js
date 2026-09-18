/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        body: "#030303",
        inputBg: "#1A1A1A",
        mutedText: "#A5A5A5",
        primary: "#55BF9A",
      },
    },
  },
  plugins: [],
};
