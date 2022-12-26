import type { HSL, RGB } from "../types";

const SEPARATOR = ", ";

export const rgbToString = (rgb: RGB, opacity: number) =>
  opacity !== 1
    ? `rgba(${rgb.join(SEPARATOR)}, ${opacity})`
    : `rgb(${rgb.join(SEPARATOR)})`;

export const hslToString = ([h, s, l]: HSL, opacity: number) =>
  opacity !== 1
    ? `hsla(${h}, ${s}%, ${l}%, ${opacity})`
    : `hsl(${h}, ${s}%, ${l}%)`;

export const hslToInputString = ([h, s, l]: HSL) => `${h}, ${s}%, ${l}%`;

export const rgbToInputString = (rgb: RGB) => rgb.join(SEPARATOR);
