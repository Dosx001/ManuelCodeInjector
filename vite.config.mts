import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

export default defineConfig({
  build: {
    modulePreload: false,
  },
  plugins: [
    solid(),
    webExtension({
      browser: "firefox",
      skipManifestValidation: true,
      manifest: () => {
        const pkg = readJsonFile("package.json");
        return {
          ...readJsonFile("src/manifest.json"),
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
        };
      },
      watchFilePaths: ["package.json", "src/manifest.json"],
    }),
  ],
});
