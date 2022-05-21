import type { HSL, RGB } from "../types";

export const rgbToString = (rgb: RGB) => `rgb(${rgb.join(", ")})`;

export const hslToString = ([h, s, l]: HSL) => `hsl(${h}, ${s}%, ${l}%)`;

export const hslToInputString = ([h, s, l]: HSL) => `${h}, ${s}%, ${l}%`;
