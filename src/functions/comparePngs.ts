import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { XOR } from "ts-xor";

type ComparePngsResult = XOR<
  {
    equal: true;
  },
  {
    equal: false;
    diffPng: PNG;
  }
>;

export function comparePngs(
  png1: PNG,
  png2: PNG,
  threshold: number,
): ComparePngsResult {
  const { width, height } = png1;

  const diffPng = new PNG({ width, height });

  const numDiffPixels = pixelmatch(
    png1.data,
    png2.data,
    diffPng.data,
    width,
    height,
    {
      threshold,
    },
  );

  if (numDiffPixels <= 0) {
    return {
      equal: true,
    };
  }

  return {
    equal: false,
    diffPng,
  };
}
