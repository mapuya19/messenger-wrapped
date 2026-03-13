/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
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


