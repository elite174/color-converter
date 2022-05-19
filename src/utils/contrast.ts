import { hexToRgb } from "./converters";

const computeLuminance = (r: number, g: number, b: number): number => {
  const a = [r, g, b].map((value) => {
    const normalizedValue = value / 255;

    return normalizedValue <= 0.03928
      ? normalizedValue / 12.92
      : ((normalizedValue + 0.055) / 1.055) ** 2.4;
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

/**
 * Returns contrast ratio of 2 colors
 * @param color1 hex color
 * @param color2 hex color
 */
export const computeContrastRatio = (
  color1: string,
  color2: string
): number | null => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return null;
  }

  const color1Luminance = computeLuminance(...rgb1);
  const color2Luminance = computeLuminance(...rgb2);

  return (
    (Math.max(color1Luminance, color2Luminance) + 0.05) /
    (Math.min(color1Luminance, color2Luminance) + 0.05)
  );
};

export const getBestContrastColor = (
  color1: string,
  color2: string,
  backgroundColor: string
): string => {
  const contrast1 = computeContrastRatio(color1, backgroundColor);
  const contrast2 = computeContrastRatio(color2, backgroundColor);

  if (contrast1 === null) return color2;
  if (contrast2 === null) return color1;

  return contrast1 > contrast2 ? color1 : color2;
};
