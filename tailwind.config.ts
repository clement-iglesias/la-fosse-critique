import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fosse: {
          bg: '#0a0a0a',
          surface: '#141414',
          card: '#1c1c1c',
          border: '#363636',
          orange: '#ff5c1a',
          'orange-dim': '#cc4a15',
          amber: '#f59e0b',
          muted: '#a0a0a8',
          text: '#f2f2f2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'concert-glow': 'radial-gradient(ellipse at top, #ff5c1a22 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}

export default config
