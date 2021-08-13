module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'purple-standard': '#22223B',
        'purple-dark': '#4A4E69',
        'orange-standard': '#EE9B00',
        'gray-standard': '#1F2833'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}