import { readFileSync } from "fs";
import { describe, it, expect } from "vitest";
import { comparePdfs } from "../functions";

describe("comparePdfs", () => {
  it("should consider two identical pdfs as equal", async () => {
    const file = readFileSync("./src/tests/data/baseline1.pdf");

    const { equal, diffs, diffPageCount } = await comparePdfs(file, file);

    expect(equal).toBe(true);
    expect(diffs).toBeUndefined();
    expect(diffPageCount).toBeUndefined();
  });

  it("should correclty identify the diffs in two different pdfs", async () => {
    const file1 = readFileSync("./src/tests/data/baseline1.pdf");
    const file2 = readFileSync("./src/tests/data/baseline1-with-diffs.pdf");

    const expectedPage1Diff = readFileSync(
      "./src/tests/data/baseline1-page-1-diff.png",
    );
    const expectedPage2Diff = readFileSync(
      "./src/tests/data/baseline1-page-2-diff.png",
    );

    const { equal, diffs, diffPageCount } = await comparePdfs(file1, file2);

    const [diff1, diff2] = diffs ?? [];

    expect(equal).toBe(false);
    expect(diff1?.diffPng.equals(expectedPage1Diff)).toBe(true);
    expect(diff2?.diffPng.equals(expectedPage2Diff)).toBe(true);
    expect(diffs?.length).toBe(2);
    expect(diffPageCount).toBe(false);
  });

  it("should consider two pdfs not equal if page counts differ with no other diffs", async () => {
    const file1 = readFileSync("./src/tests/data/baseline2.pdf");
    const file2 = readFileSync("./src/tests/data/baseline2-only-page-1.pdf");

    const { equal, diffs, diffPageCount } = await comparePdfs(file1, file2);

    expect(equal).toBe(false);
    expect(diffs?.length).toBe(0);
    expect(diffPageCount).toBe(true);
  });

  it("should consider two pdfs not equal if page counts differ with other diffs", async () => {
    const file1 = readFileSync("./src/tests/data/baseline2.pdf");
    const file2 = readFileSync(
      "./src/tests/data/baseline2-only-page-1-with-diffs.pdf",
    );

    const expectedDiff = readFileSync("./src/tests/data/baseline2-diff.png");

    const { equal, diffs, diffPageCount } = await comparePdfs(file1, file2);

    const [diff] = diffs ?? [];

    expect(equal).toBe(false);
    expect(diff?.diffPng.equals(expectedDiff)).toBe(true);
    expect(diffs?.length).toBe(1);
    expect(diffPageCount).toBe(true);
  });
});
