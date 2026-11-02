/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0F172A',
          card: '#1E293B',
          border: 'rgba(255, 255, 255, 0.08)',
          primary: '#2563EB',
          accent: '#38BDF8',
          emerald: '#10B981'
        }
      }
    },
  },
  plugins: [],
}
