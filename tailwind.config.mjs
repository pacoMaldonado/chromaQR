/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#09090B',
          surface: '#121215',
          elevated: '#18181B',
          active: '#27272A',
          border: '#27272A',
          accent: '#6366F1',
          'accent-hover': '#4F46E5',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          text: '#FAFAFA',
          muted: '#A1A1AA',
          subtle: '#71717A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 8px 30px rgba(0, 0, 0, 0.45)',
        glow: '0 0 20px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};
