/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-01': 'linear-gradient(119deg, #27AF60, #F2C511, #647eff)'
      },
    },
  },
  plugins: [],
}