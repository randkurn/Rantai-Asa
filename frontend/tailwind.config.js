export default { content: ["./index.html", "./src/**/*.{js,jsx}"], theme: { extend: { colors: { navy: "#1F3A5F", teal: "#0EA5A4" } } }, plugins: [] }
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1F3A5F',
          dark: '#162B47',
          light: '#2A4D7D',
        },
        teal: {
          DEFAULT: '#0EA5A4',
          dark: '#0B8584',
          light: '#E6F7F7',
        },
        status: {
          critical: '#DC2626',
          high: '#C2410C',
          elevated: '#F59E0B',
          moderate: '#0284C7',
          verified: '#16A34A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  },
  plugins: []
};
