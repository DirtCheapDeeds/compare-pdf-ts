import { readFileSync } from "fs";
import { describe, it, expect } from "vitest";
import { PNG } from "pngjs";
import { comparePdfs } from "../functions";

describe("comparePdfs", () => {
  it("should consider two identical pdfs as equal", async () => {
    const file1 = readFileSync("./src/tests/data/baseline1.pdf");
    const file2 = readFileSync("./src/tests/data/baseline1.pdf");

    const { equal, diffs, diffPageCount } = await comparePdfs(file1, file2);

    expect(equal).toBe(true);
    expect(diffs).toBeUndefined();
    expect(diffPageCount).toBeUndefined();
  });

  it("should correclty identify the diffs in two difference pdfs", async () => {
    const file1: Buffer = readFileSync("./src/tests/data/baseline1.pdf");
    const file2: Buffer = readFileSync(
      "./src/tests/data/baseline1-with-diffs.pdf",
    );

    const expectedPage1Diff: Buffer = readFileSync(
      "./src/tests/data/baseline1-page-1-diff.png",
    );
    const expectedPage2Diff: Buffer = readFileSync(
      "./src/tests/data/baseline1-page-2-diff.png",
    );

    const { equal, diffs, diffPageCount } = await comparePdfs(file1, file2);

    const [diff1, diff2] = diffs ?? [];

    const diff1PngBuffer = diff1 ? PNG.sync.write(diff1.diffPng) : null;
    const diff2PngBuffer = diff2 ? PNG.sync.write(diff2.diffPng) : null;

    expect(equal).toBe(false);
    expect(diff1PngBuffer?.equals(expectedPage1Diff)).toBe(true);
    expect(diff2PngBuffer?.equals(expectedPage2Diff)).toBe(true);
    expect(diffs?.length).toBe(2);
    expect(diffPageCount).toBe(false);
  });
});
