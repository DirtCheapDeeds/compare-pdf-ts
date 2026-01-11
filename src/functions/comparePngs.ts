import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { type XOR } from "ts-xor";

type ComparePngsResult = XOR<
  {
    equal: true;
  },
  {
    equal: false;
    diffPng: PNG;
  }
>;

type ComparePngsParams = {
  png1: PNG;
  png2: PNG;
  threshold: number;
  antiAliasing: boolean;
  alpha: number;
  antiLiasingColor: [number, number, number];
  diffColor: [number, number, number];
  diffColorAlt: [number, number, number];
  diffMask: boolean;
};

export function comparePngs({
  png1,
  png2,
  threshold,
  antiAliasing,
  alpha,
  antiLiasingColor,
  diffColor,
  diffColorAlt,
  diffMask,
}: ComparePngsParams): ComparePngsResult {
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
      includeAA: antiAliasing,
      alpha,
      aaColor: antiLiasingColor,
      diffColor,
      diffColorAlt,
      diffMask,
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
