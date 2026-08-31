/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to look at your new 'app' folder
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  
  presets: [require("nativewind/preset")],
  
  theme: {
    extend: {},
  },
  
  plugins: [],
};