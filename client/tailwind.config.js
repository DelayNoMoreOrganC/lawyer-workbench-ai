/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1677FF',
          hover: '#0958D9',
          light: '#E6F4FF'
        },
        success: '#52C41A',
        warning: '#FAAD14',
        danger: '#FF4D4F',
        info: '#1677FF'
      }
    },
  },
  plugins: [],
}
