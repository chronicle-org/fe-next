import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'], // optional but recommended
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // 👈 make sure your components are scanned
  ],
  theme: {
    extend: {},
  },
  plugins: [typography],
};

export default config;
