import customAnimations from './src/utils/customAnimations.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        german: {
          red: '#DD0000',
          gold: '#FFCE00',
          black: '#000000'
        },
        // 分词填空主题色
        dark: {
          bg: '#000000',
          surface: '#0a0a0a',
          card: '#111111',
          border: '#1f1f1f'
        },
        accent: {
          purple: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95'
          }
        },
        status: {
          success: '#10b981',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6'
        }
      },
      animation: {
        ...customAnimations,
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s ease-out',
        'slide-in-down': 'slideInDown 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'border-pulse': 'borderPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite'
      },
      keyframes: customAnimations,
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.6)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.5)'
      },
      backdropBlur: {
        xs: '2px'
      }
    },
  },
  plugins: [],
}
