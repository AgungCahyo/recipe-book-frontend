/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
   darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        primary: '#ffb901',
        'primary-dark': '#3B6564',
        accent: '#ffffff',
        'accent-dark': '#E5D5C2',
        dark: '#000000',
        muted: '#B8D0C8',
        'background-light': '#FFFFFF',
        'background-dark': '#0B0F10', 
      },
        fontFamily: {
         arch: ['ArchCondensed'],
        }
    },
  },
  plugins: [],
}
