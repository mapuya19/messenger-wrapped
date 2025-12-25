/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        messenger: {
          blue: '#0084FF',
          purple: '#9B59B6',
          dark: '#0A1628',
        },
      },
      backgroundImage: {
        'gradient-messenger': 'linear-gradient(135deg, #0084FF 0%, #9B59B6 100%)',
      },
    },
  },
  plugins: [],
}

