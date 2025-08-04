/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
   darkMode: 'media', // atau 'class' kalau kamu toggle dark mode manual
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F9FAFB', // tailwind: gray-50
          dark: '#111827',  // tailwind: gray-900
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937', // tailwind: gray-800
        },
        text: {
          light: '#111827',
          dark: '#F9FAFB',
        },
        muted: {
          light: '#6B7280', // gray-500
          dark: '#9CA3AF',  // gray-400
        },
        border: {
          light: '#E5E7EB', // gray-200
          dark: '#374151',  // gray-700
        },
        primary: {
          DEFAULT: '#2563EB',     // blue-600
          dark: '#60A5FA',        // blue-400
        },
        danger: {
          DEFAULT: '#DC2626',     // red-600
        },
        success: {
          DEFAULT: '#22C55E',     // green-500
        },
      },
    },
  },
  plugins: [],
};
