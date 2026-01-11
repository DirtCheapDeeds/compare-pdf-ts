import {
  getDocument,
  type PDFDocumentProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { convertPdfToPngs } from "./convertPdfToPngs";
import { PNG } from "pngjs";
import { comparePngs } from "./comparePngs";
import { XOR } from "ts-xor";

export type ComparePdfsOptions = {
  scale?: number;
  threshold?: number;
};

export type ComparePdfsResult = XOR<
  {
    equal: true;
  },
  {
    equal: false;
    diffs: PageDiff[];
    mismatchedPageCount: boolean;
  }
>;

export type PageDiff = {
  pageNumber: number;
  diffPng: PNG;
};

export async function comparePdfs(
  file1: Buffer,
  file2: Buffer,
  options?: ComparePdfsOptions,
): Promise<ComparePdfsResult> {
  const { scale = 1.0, threshold = 0.1 } = options ?? {};

  const pdf1: PDFDocumentProxy = await getDocument({
    data: file1,
  }).promise;
  const pdf2: PDFDocumentProxy = await getDocument({
    data: file2,
  }).promise;

  const pngs1: PNG[] = await convertPdfToPngs(pdf1, scale);
  const pngs2: PNG[] = await convertPdfToPngs(pdf2, scale);

  const unfilteredDiffs = await Promise.all(
    pngs1.map(async (png1, index) => {
      const pageNumber = index + 1;

      const png2 = pngs2[index];

      if (!png2) {
        return undefined;
      }

      const { equal, diffPng } = comparePngs(png1, png2, threshold);

      if (equal) {
        return undefined;
      }

      return {
        pageNumber,
        diffPng,
      };
    }),
  );

  const diffs: PageDiff[] = unfilteredDiffs.filter(
    (diff) => diff !== undefined,
  );

  const mismatchedPageCount = pngs1.length !== pngs2.length;

  if (diffs.length > 0 || mismatchedPageCount) {
    return {
      equal: false,
      diffs,
      mismatchedPageCount,
    };
  }

  return {
    equal: true,
  };
}
