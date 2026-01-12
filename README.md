# compare-pdf-ts

Node package that compares PDF files via pixel comparison. Largely inspired by the [pdf-compare](https://github.com/marcdacz/compare-pdf) package, however this package differs in that it does everything in-memory without the need for reading/writing files.

## Dependencies

This package requires the following dependencies in your project:

- [pdf-dist](https://github.com/mozilla/pdf.js)
- [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas)

## Setup

Install this package and required dependencies:

```sh
npm install compare-pdf-ts
npm install pdf-dist
npm install @napi-rs/canvas
```

## Usage

```ts
import { comparePdfs } from "compare-pdf-ts";

const pdf1 = readFileSync("./example1.pdf");
const pdf2 = readFileSync("./example2.pdf");

const { equal, diffs } = await comparePdfs(pdf1, pdf2);

if (!equal) {
  diffs.forEach(({ diffPng, pageNumber }) => {
    writeFileSync(`page-${pageNumber}-diff.png`, diffPng);
  });
}
```

## Comparison Options

You can optionally pass some options when calling the `comparePdfs` function to tailor its behavior:

```ts
const { equal, diffs } = await comparePdfs(pdf1, pdf2, {
  pngScale: 1.5,
  diffThreshold: 0.2,
});
```

The options type:

```ts
type ComparePdfsOptions = {
  pngScale: number;
  considerAntiAliasing: boolean;
  includeDiffMask: boolean;
  diffThreshold: number;
  diffAlpha: number;
  diffAntiAliasingColor: [number, number, number];
  diffColor: [number, number, number];
  diffColorAlt: [number, number, number];
};
```

The default option values:

```ts
const DEFAULT_COMPARE_PDFS_OPTIONS: ComparePdfsOptions = {
  pngScale: 1.0,
  considerAntiAliasing: false,
  includeDiffMask: false,
  diffThreshold: 0.1,
  diffAlpha: 0.1,
  diffAntiAliasingColor: [255, 255, 0],
  diffColor: [255, 0, 0],
  diffColorAlt: [255, 0, 0],
};
```
