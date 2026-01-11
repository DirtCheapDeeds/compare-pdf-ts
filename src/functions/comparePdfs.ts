import {
  getDocument,
  type PDFDocumentProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { PNG } from "pngjs";
import type { XOR } from "ts-xor";
import { convertPdfToPngs } from "./convertPdfToPngs";
import { comparePngs } from "./comparePngs";

export const DEFAULT_COMPARE_PDFS_OPTIONS: ComparePdfsOptions = {
  pngScale: 1.0,
  considerAntiAliasing: false,
  includeDiffMask: false,
  diffThreshold: 0.1,
  diffAlpha: 0.1,
  diffAntiAliasingColor: [255, 255, 0],
  diffColor: [255, 0, 0],
  diffColorAlt: [255, 0, 0],
};

export type ComparePdfsOptions = {
  pngScale: number;
  considerAntiAliasing: boolean;
  includeDiffMask: boolean;
  diffThreshold: number;
  diffAlpha: number;
  diffAntiAliasingColor: [number, number, number];
  diffColor: [number, number, number];
  diffColorAlt: [number, number, number];
};

export type ComparePdfsResult = XOR<
  {
    equal: true;
  },
  {
    equal: false;
    diffs: PageDiff[];
    diffPageCount: boolean;
  }
>;

export type PageDiff = {
  pageNumber: number;
  diffPng: Buffer;
};

export async function comparePdfs(
  file1: Buffer,
  file2: Buffer,
  options?: Partial<ComparePdfsOptions>,
): Promise<ComparePdfsResult> {
  const {
    pngScale,
    considerAntiAliasing,
    includeDiffMask,
    diffThreshold,
    diffAlpha,
    diffAntiAliasingColor,
    diffColor,
    diffColorAlt,
  }: ComparePdfsOptions = {
    ...DEFAULT_COMPARE_PDFS_OPTIONS,
    ...options,
  };

  // getDocument requires data to be Uint8Array
  const file1Converted = Uint8Array.from(file1);
  const file2Converted = Uint8Array.from(file2);

  const pdf1: PDFDocumentProxy = await getDocument({
    data: file1Converted,
  }).promise;
  const pdf2: PDFDocumentProxy = await getDocument({
    data: file2Converted,
  }).promise;

  const pngs1: PNG[] = await convertPdfToPngs({
    pdf: pdf1,
    scale: pngScale,
  });
  const pngs2: PNG[] = await convertPdfToPngs({
    pdf: pdf2,
    scale: pngScale,
  });

  const diffs: PageDiff[] = pngs1.flatMap((png1, index) => {
    const pageNumber = index + 1;

    const png2 = pngs2[index];

    if (!png2) {
      return [];
    }

    const { equal, diffPng } = comparePngs({
      png1,
      png2,
      threshold: diffThreshold,
      antiAliasing: considerAntiAliasing,
      alpha: diffAlpha,
      antiLiasingColor: diffAntiAliasingColor,
      diffColor,
      diffColorAlt,
      diffMask: includeDiffMask,
    });

    if (equal) {
      return [];
    }

    return {
      pageNumber,
      diffPng: PNG.sync.write(diffPng),
    };
  });

  const diffPageCount = pngs1.length !== pngs2.length;

  if (diffs.length > 0 || diffPageCount) {
    return {
      equal: false,
      diffs,
      diffPageCount,
    };
  }

  return {
    equal: true,
  };
}
