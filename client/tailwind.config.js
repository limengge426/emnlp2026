/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-gold': '#D4A574',
        'burnt-red': '#C96442',
        'cream': '#FAF7F2',
        'warm-gray': '#F0EBE3',
        'dark-brown': '#1A1612',
        'med-brown': '#6B5B4E',
        'accent-brown': '#8B6F5E',
        'border-beige': '#E8DDD4',
        'success-green': '#5A7A5A',
      },
      fontFamily: {
        'serif-title': ['Playfair Display', 'serif'],
        'serif-body': ['Source Serif 4', 'Lora', 'serif'],
      },
    },
  },
  plugins: [],
}
