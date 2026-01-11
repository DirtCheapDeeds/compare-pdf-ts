import { readFileSync } from "fs";
import { comparePdfs } from "../functions";

describe("comparePdfs", () => {
  it("should consider two identical PDFs as equal", async () => {
    const file: Buffer = readFileSync("./data/baseline1.pdf");

    const { equal, diffs, diffPageCount } = await comparePdfs(file, file);

    expect(equal).toBe(true);
    expect(diffs).toBeUndefined();
    expect(diffPageCount).toBeUndefined();
  });
});
