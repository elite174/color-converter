export const hexToRgb = (hex: string): [number, number, number] | null => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

  const modifiedHex = hex.replace(
    shorthandRegex,
    (_, r, g, b) => r + r + g + g + b + b
  );

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(modifiedHex);

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
