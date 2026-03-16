import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce7ff',
          200: '#bfd1ff',
          300: '#92b2ff',
          400: '#5d88ff',
          500: '#305bff',
          600: '#2142db',
          700: '#1e36b2',
          800: '#1f318c',
          900: '#1f2e6e'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
};

export default config;
