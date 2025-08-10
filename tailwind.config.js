module.exports = {
  // Specify the paths to all of the template files in your project
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      // You can add custom colors, spacing, etc. here as needed
    },
    fontFamily: {
      arimo: ['Arimo', 'sans-serif'],
      crimson: ['Crimson Text', 'serif'],
      montserrat: ['Montserrat', 'sans-serif'],
    },
  },
  plugins: [
    // Add Tailwind plugins here if necessary
  ],
}
