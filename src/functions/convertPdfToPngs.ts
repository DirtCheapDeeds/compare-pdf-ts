import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
} from "@napi-rs/canvas";
import {
  type PageViewport,
  type PDFPageProxy,
  type PDFDocumentProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";
import { PNG } from "pngjs";

export async function convertPdfToPngs(
  pdf: PDFDocumentProxy,
  scale: number,
): Promise<PNG[]> {
  const { numPages } = pdf;
  const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

  const pngs: PNG[] = await Promise.all(
    pageNumbers.map(async (pageNumber) => {
      const page: PDFPageProxy = await pdf.getPage(pageNumber);
      const viewport: PageViewport = page.getViewport({ scale });
      const canvas: Canvas = createCanvas(viewport.width, viewport.height);
      const canvasContext: CanvasRenderingContext2D = canvas.getContext("2d");

      await page.render({
        viewport,
        canvas,
        canvasContext,
      }).promise;

      const pngBuffer: Buffer = canvas.toBuffer("image/png");

      const png: PNG = PNG.sync.read(pngBuffer);

      return png;
    }),
  );

  return pngs;
}
