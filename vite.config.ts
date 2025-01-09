import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import RubyPlugin from "vite-plugin-ruby";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [RubyPlugin()],
  resolve: {
    alias: {
      stores: path.resolve(__dirname, "./app/javascript/stores"),
      components: path.resolve(__dirname, "./app/javascript/components"),
      utils: path.resolve(__dirname, "./app/javascript/utils"),
    },
  },
});
