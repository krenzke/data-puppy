import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import RubyPlugin from "vite-plugin-ruby";

// https://vite.dev/config/
export default defineConfig({
  plugins: [RubyPlugin()],
});
