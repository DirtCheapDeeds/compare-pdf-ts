import { comparePdfs } from "../functions";
import { readFileSync } from "fs";

describe("comparePdfs", () => {
  it("should consider two identical PDFs as equal", async () => {
    const file: Buffer = readFileSync("./data/baseline1.pdf");

    const { equal, diffs, mismatchedPageCount } = await comparePdfs(file, file);

    expect(equal).toBe(true);
    expect(diffs).toBeUndefined();
    expect(mismatchedPageCount).toBeUndefined();
  });
});
