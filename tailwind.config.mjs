/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'rgb(var(--bg-primary) / <alpha-value>)',
          surface: 'rgb(var(--bg-surface) / <alpha-value>)',
          elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
          active: 'rgb(var(--bg-active) / <alpha-value>)',
          border: 'rgb(var(--border-subtle) / <alpha-value>)',
          accent: 'rgb(var(--accent-primary) / <alpha-value>)',
          'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',
          success: 'rgb(var(--status-success) / <alpha-value>)',
          warning: 'rgb(var(--status-warning) / <alpha-value>)',
          danger: 'rgb(var(--status-error) / <alpha-value>)',
          text: 'rgb(var(--text-primary) / <alpha-value>)',
          muted: 'rgb(var(--text-secondary) / <alpha-value>)',
          subtle: 'rgb(var(--text-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        glow: '0 0 20px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};
