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
          bg: '#080808',
          surface: '#111111',
          card: '#181818',
          border: '#2a2a2a',
          orange: '#ff5c1a',
          'orange-dim': '#cc4a15',
          amber: '#f59e0b',
          muted: '#6b7280',
          text: '#e5e5e5',
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
