const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  corePlugins: {
    backdropBlur: false,
  },
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },
      colors: {
        // 企业级配色方案
        primary: {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        enterprise: {
          bg: '#f8fafc',
          sidebar: '#1e293b',
          header: '#334155',
          card: '#ffffff',
          border: '#e2e8f0',
          text: {
            primary: '#0f172a',
            secondary: '#64748b',
            muted: '#94a3b8',
          }
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'enterprise': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'enterprise-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      light: {
        colors: {
          primary: {
            DEFAULT: "#3b82f6",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#64748b",
            foreground: "#ffffff",
          },
        }
      }
    }
  })]
}
