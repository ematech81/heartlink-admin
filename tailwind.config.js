/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#FF4B7A', light: '#FF7EA0', dark: '#E03060' },
        sidebar:   { DEFAULT: '#0F172A', light: '#1E293B' },
        surface:   '#F8FAFC',
      },
    },
  },
  plugins: [],
};
