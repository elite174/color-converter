import { RGB } from "../types";

export const rgbToString = (rgb: RGB) => `rgb(${rgb.join(", ")})`;
