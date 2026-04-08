/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        surface: {
          950: '#05040d',
          900: '#0b0918',
          800: '#110e25',
          700: '#181430',
          600: '#211c40',
        },
        brand: {
          300: '#b8a9ff',
          400: '#9b87f5',
          500: '#7c63e8',
          600: '#5e47c4',
        },
        gold: {
          200: '#fef3c7',
          300: '#fde68a',
          400: '#f59e0b',
          500: '#d97706',
        },
        violet: {
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
        },
        sky: {
          300: '#93c5fd',
          400: '#60a5fa',
        },
        emerald: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
      animation: {
        'slide-up':   'slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':    'fadeIn 0.25s ease both',
        'scale-in':   'scaleIn 0.2s ease both',
        'shimmer':    'shimmer 2s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow':  'spin 12s linear infinite',
      },
      keyframes: {
        slideUp:    { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:     { from: { opacity: 0 }, to: { opacity: 1 } },
        scaleIn:    { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        pulseSoft:  { '0%,100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
}
