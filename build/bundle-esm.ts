import { build, BuildOptions } from "esbuild";

const options: BuildOptions = {
  entryPoints: ["src/index.ts"],
  outfile: "dist/esm/index.mjs",
  platform: "node",
  format: "esm",
  bundle: true,
  external: ["@napi-rs/canvas", "pdfjs-dist"],
  loader: { ".node": "file" },
  minify: true,
  treeShaking: true,
  sourcemap: true,
};

build(options).catch(console.error);
