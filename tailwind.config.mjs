/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          active: 'var(--bg-active)',
          border: 'var(--border-subtle)',
          accent: 'var(--accent-primary)',
          'accent-hover': 'var(--accent-primary-hover)',
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-error)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          subtle: 'var(--text-muted)',
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
