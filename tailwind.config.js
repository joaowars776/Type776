/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sepia: {
          bg: '#f4ecd8',
          text: '#5b4636',
          accent: '#8f7056'
        },
        dark: {
          bg: '#1a1a1a',
          text: '#e5e5e5',
          accent: '#3b82f6'
        },
        forest: {
          bg: '#1a2f1a',
          text: '#e8f5e9',
          accent: '#66bb6a'
        },
        cyberpunk: {
          bg: '#050505',
          text: '#00ff9f',
          accent: '#ff003c'
        },
        contrast: {
          bg: '#000000',
          text: '#ffffff',
          accent: '#ffff00'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'cursor-blink': 'blink 1s step-end infinite',
        'glitch': 'glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite',
        'ice-pulse': 'icePulse 4s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        icePulse: {
          '0%, 100%': { backgroundColor: '#0f172a' },
          '50%': { backgroundColor: '#162236' }
        }
      }
    }
  },
  plugins: [],
}