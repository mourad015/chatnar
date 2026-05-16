import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:       '#FF3D00',
          'orange-light':'#FF6B35',
          green:        '#53FC18',
          red:          '#FF1744',
          gold:         '#FFD700',
          black:        '#000000',
          sidebar:      '#0A0A0A',
          card:         '#111111',
          'card-hover': '#161616',
          border:       '#1E1E1E',
          muted:        '#666666',
          'yes-bg':     '#1A4D1A',
          'no-bg':      '#4D1A1A',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'Anton', 'sans-serif'],
        body:    ['Inter', 'DM Sans', 'sans-serif'],
      },
      boxShadow: {
        orange: '0 0 24px rgba(255, 61,  0,  0.45)',
        green:  '0 0 24px rgba(83,  252, 24, 0.45)',
        gold:   '0 0 24px rgba(255, 215, 0,  0.45)',
        red:    '0 0 24px rgba(255, 23,  68, 0.45)',
        card:   '0 0 0 1px #1E1E1E',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF3D00, #FF6B35)',
        'green-gradient':  'linear-gradient(135deg, #53FC18, #3BC912)',
        'dark-gradient':   'linear-gradient(180deg, transparent, #000000)',
        'card-gradient':   'linear-gradient(180deg, transparent 50%, #000000 100%)',
      },
      animation: {
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-orange': 'glowOrange 2s ease-in-out infinite alternate',
        'coin-drop':   'coinDrop 0.6s ease-out',
      },
      keyframes: {
        glowOrange: {
          '0%':   { boxShadow: '0 0 10px rgba(255,61,0,0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(255,61,0,0.7)' },
        },
        coinDrop: {
          '0%':   { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        }
      },
      borderRadius: {
        card: '8px',
      },
    }
  },
  plugins: [],
}

export default config