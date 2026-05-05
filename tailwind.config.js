/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false, // Disable to avoid conflicts with Ant Design
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1b3a5c',
          light: '#E8EEF7',
          dark: '#152E48',
        },
        accent: '#F97316',
        bg: {
          page: '#F8FAFC',
          card: '#FFFFFF',
          subtle: '#F8FAFC',
          input: '#F1F5F9',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          text: '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          text: '#92400E',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          text: '#991B1B',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          text: '#1E40AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          input: '#F1F5F9',
        },
        brand: {
          accent: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        pill: '999px',
      },
      boxShadow: {
        toast: '0 8px 24px rgba(15,23,42,0.15)',
      },
    },
  },
  plugins: [],
}
