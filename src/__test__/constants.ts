export const enum ColorFormat {
  HEX = "HEX",
  HSL = "HSL",
  RGB = "RGB",
}

export const getInputWrapperTestId = (format: ColorFormat) =>
  `wrapper-${format}`;
