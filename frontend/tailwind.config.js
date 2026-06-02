/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#f8f9fa',
          card: '#ffffff',
          subtle: '#f1f3f5',
        },
        accent: {
          DEFAULT: '#0d9488',
          light: '#ccfbf1',
          hover: '#0f766e',
        },
        status: {
          lost: '#dc2626',
          found: '#16a34a',
          resolved: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px -4px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
