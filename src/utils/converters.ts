import { DEFAULT_OPACITY } from "../constants";
import { HSL } from "../types";

const shorthandRegex = /^#([a-f\d])([a-f\d])([a-f\d])$/i;

/**
 * Returns full hex color
 * @returns
 */
export const normalizeHex = (rawHex: string): string => {
  if (rawHex.length > 4) return rawHex;

  const modifiedHex = rawHex.replace(
    shorthandRegex,
    (_, r, g, b) => `#${r + r + g + g + b + b}`
  );

  return modifiedHex;
};

export const hexToRgb = (
  normalizedHex: string
): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    normalizedHex
  );

  return result
    ? [
        // red
        parseInt(result[1], 16),
        // green
        parseInt(result[2], 16),
        // blue
        parseInt(result[3], 16),
      ]
    : null;
};

const componentToHex = (c: number) => c.toString(16).padStart(2, "0");

export const rgbToHex = (r: number, g: number, b: number) =>
  "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

export const rgbToHsl = (r: number, g: number, b: number): HSL => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const add = max + min;

  const hue =
    min === max
      ? 0
      : r === max
      ? ((60 * (g - b)) / diff + 360) % 360
      : g === max
      ? (60 * (b - r)) / diff + 120
      : (60 * (r - g)) / diff + 240;

  const lum = 0.5 * add;

  const sat =
    lum === 0 ? 0 : lum === 1 ? 1 : lum <= 0.5 ? diff / add : diff / (2 - add);

  const h = Math.round(hue);
  const s = Math.round(sat * 100);
  const l = Math.round(lum * 100);

  return [h, s, l];
};

export const hslToHex = ([h, s, l]: HSL) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };

  return `#${f(0)}${f(8)}${f(4)}`;
};

export const opacityToHex = (opacity: number): string => {
  if (opacity === DEFAULT_OPACITY) return "";

  return Math.round(opacity * 100).toString(16);
};

export const hexStringToOpacity = (hex?: string): number => {
  if (!hex || hex.length !== 2) return DEFAULT_OPACITY;

  return parseInt(hex, 16) / 100;
};

export const roundOpacityString = (opacityString?: string): number =>
  opacityString
    ? Math.round(Number(opacityString) * 100) / 100
    : DEFAULT_OPACITY;
