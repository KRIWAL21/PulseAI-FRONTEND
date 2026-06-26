// postcss.config.js
// NOTE: When using @tailwindcss/vite plugin, Tailwind is handled by Vite directly.
// We keep only autoprefixer here to avoid double-processing Tailwind CSS.
export default {
  plugins: {
    autoprefixer: {},
  },
}
