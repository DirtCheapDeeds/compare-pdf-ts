import { build, BuildOptions } from "esbuild";

const options: BuildOptions = {
  entryPoints: ["src/index.ts"],
  outfile: "dist/esm/index.js",
  platform: "node",
  format: "esm",
  bundle: true,
  minify: true,
  treeShaking: true,
  sourcemap: true,
};

build(options).catch(console.error);
