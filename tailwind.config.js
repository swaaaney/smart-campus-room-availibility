/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        campus: {
          primary: '#7C3AED',
          deep: '#5B21B6',
          lavender: '#EDE9FE',
          bg: '#F5F3FF',
          ink: '#1E1B4B',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -15px rgba(91, 33, 182, 0.25)',
        card: '0 1px 2px rgba(30, 27, 75, 0.04), 0 12px 32px -18px rgba(91, 33, 182, 0.25)',
        glow: '0 0 0 4px rgba(124, 58, 237, 0.15)',
      },
      keyframes: {
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-14px) translateX(8px)' },
        },
      },
      animation: {
        riseIn: 'riseIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        fadeIn: 'fadeIn 0.5s ease-out both',
        floatSlow: 'floatSlow 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
