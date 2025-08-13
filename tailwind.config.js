/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
   darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        primary: '#204C4B',
        'primary-dark': '#3B6564',
        accent: '#F2E8DC',
        'accent-dark': '#E5D5C2',
        dark: '#101F24',
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
