import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/bundle.manifests.ts", // Bundle registers all of this package's manifests
      formats: ["es"],
      fileName: "member-dashboard",
    },
    outDir: "../wwwroot/App_Plugins/MemberDashboard",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // Everything under @umbraco-* is provided by the backoffice at runtime, never bundled.
      external: [/^@umbraco/],
    },
  },
});
