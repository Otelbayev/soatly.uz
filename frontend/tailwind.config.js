/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      // CSS variable-based colors for dark/light mode support
      colors: {
        gold: 'var(--gold)',
        'gold-b': 'var(--gold-bright)',
        'gold-l': 'var(--gold-light)',
        silver: 'var(--silver)',
        theme: {
          bg: 'var(--bg)',
          surface: 'var(--bg-surface)',
          surface2: 'var(--bg-surface2)',
          text: 'var(--text)',
          muted: 'var(--text-muted)',
          subtle: 'var(--text-subtle)',
          border: 'var(--border)',
        },
      },
      scale: {
        107: '1.07',
      },
    },
  },
  plugins: [],
};
