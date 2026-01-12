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
  /**
   * The scale factor to use when rendering PDF pages to PNG images. Higher values result in higher fidelity
   * images but increase processing time and memory usage. Default is 1.0.
   */
  pngScale: number;
  /**
   * Whether to consider anti-aliasing when comparing images. Default is false.
   */
  considerAntiAliasing: boolean;
  /**
   * Whether to include a diff mask in the output diff images. Default is false.
   */
  includeDiffMask: boolean;
  /**
   * The threshold for pixel color differences to be considered significant. Ranges from 0 to 1, where 0 means
   * any difference is significant and 1 means only completely different colors are significant. Default is 0.1.
   */
  diffThreshold: number;
  /**
   * The alpha transparency value to use for the diff overlay. Ranges from 0 (fully transparent) to 1 (fully opaque).
   * Default is 0.1.
   */
  diffAlpha: number;
  /**
   * The RGB color to use for highlighting anti-aliased pixels in the diff image. Default is yellow [255, 255, 0].
   */
  diffAntiAliasingColor: [number, number, number];
  /**
   * The RGB color to use for highlighting differences in the diff image. Default is red [255, 0, 0].
   */
  diffColor: [number, number, number];
  /**
   * The RGB color to use as an alternative for highlighting differences in the diff image. Default is red [255, 0, 0].
   */
  diffColorAlt: [number, number, number];
};

export type ComparePdfsResult = XOR<
  {
    equal: true;
  },
  {
    equal: false;
    /**
     * An array of diff objects containing the diff image and the page number of the diff.
     */
    diffs: PageDiff[];
    /**
     * Indicates whether the two PDFs have a different number of pages.
     */
    diffPageCount: boolean;
  }
>;

export type PageDiff = {
  /**
   * The page number (1-based index) where the difference was found.
   */
  pageNumber: number;
  /**
   * A Buffer containing the PNG image data highlighting the differences for the page.
   */
  diffPng: Buffer;
};

/**
 * Compares two PDF files provided as Buffers using image pixel comparison and returns whether they
 * are equal along with any diffs.
 * @param file1 - Buffer containing the first PDF file.
 * @param file2 - Buffer containing the second PDF file.
 * @param options - Optional comparison settings.
 * @returns A promise that resolves to a `ComparePdfsResult` indicating if the PDFs are equal and any diffs.
 */
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
