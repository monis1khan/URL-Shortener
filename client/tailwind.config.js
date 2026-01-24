/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['monospace'],
      },
      colors: {
        'gray-950': '#1a1a1a',
        'gray-900': '#2a2a2a',
        'green-400': '#32cd32',
        'green-600': '#228b22',
      },
      boxShadow: {
        'green-glow': '0 0 15px 5px rgba(50, 205, 50, 0.2)',
      },
    },
  },
  plugins: [],
}