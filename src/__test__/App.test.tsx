import { render, fireEvent } from "@solidjs/testing-library";
import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";

import { ColorFormat, getInputWrapperTestId } from "./constants";

import App from "../App";

const FORMATS: ColorFormat[] = [
  ColorFormat.HEX,
  ColorFormat.RGB,
  ColorFormat.HSL,
];

const INPUT_TEST_VALUES: Record<ColorFormat, string> = {
  [ColorFormat.HEX]: "#ffed24",
  [ColorFormat.RGB]: "255, 237, 36",
  [ColorFormat.HSL]: "55, 100%, 57%",
};

const COPY_TEST_VALUES: Record<ColorFormat, string> = {
  [ColorFormat.HEX]: INPUT_TEST_VALUES.HEX,
  [ColorFormat.RGB]: `rgb(${INPUT_TEST_VALUES.RGB})`,
  [ColorFormat.HSL]: `hsl(${INPUT_TEST_VALUES.HSL})`,
};

const TEST_OPACITY = 0.62;

const COPY_TEST_VALUES_WITH_OPACITY: Record<ColorFormat, string> = {
  [ColorFormat.HEX]: `${INPUT_TEST_VALUES.HEX}3e`,
  [ColorFormat.RGB]: `rgba(${INPUT_TEST_VALUES.RGB}, ${TEST_OPACITY})`,
  [ColorFormat.HSL]: `hsla(${INPUT_TEST_VALUES.HSL}, ${TEST_OPACITY})`,
};

const queryElements = <
  ElementType extends HTMLElement,
  QueryFuncType extends (id: string) => ElementType | null = (
    id: string
  ) => ElementType | null
>(
  queryByTestId: QueryFuncType,
  selector: string
): Record<ColorFormat, ElementType> => {
  const nodes = FORMATS.map((format) => [
    format,
    queryByTestId(getInputWrapperTestId(format))?.querySelector(selector),
  ]);

  for (const [_, node] of nodes) {
    expect(node).toBeDefined();
  }

  return Object.fromEntries(nodes);
};

const makeParsingTest = (colorFormat: ColorFormat) =>
  test(`Parsing ${colorFormat} color works`, () => {
    const { unmount, queryByTestId } = render(() => <App />);

    const inputs = queryElements<HTMLInputElement>(queryByTestId, "input");

    fireEvent.input(inputs[colorFormat], {
      target: { value: INPUT_TEST_VALUES[colorFormat] },
    });

    Object.entries(inputs).forEach(([format, input]) =>
      expect(input.value).toBe(INPUT_TEST_VALUES[format as ColorFormat])
    );

    unmount();
  });

const makeCopyTest = (colorFormat: ColorFormat) =>
  test.concurrent(`Copy ${colorFormat} color`, async () => {
    const { unmount, queryByTestId } = render(() => <App />);

    const buttons = queryElements<HTMLButtonElement>(queryByTestId, "button");
    const inputs = queryElements<HTMLInputElement>(queryByTestId, "input");

    // Stub clipboard
    userEvent.setup();

    // set hex color
    fireEvent.input(inputs[ColorFormat.HEX], {
      target: { value: INPUT_TEST_VALUES[ColorFormat.HEX] },
    });

    // copy color without opacity
    fireEvent.click(buttons[colorFormat as ColorFormat]);
    let copiedText = await globalThis.navigator.clipboard.readText();

    expect(copiedText).toBe(COPY_TEST_VALUES[colorFormat]);

    // set opacity
    const opacityInput = queryByTestId("input-opacity");
    expect(opacityInput).not.toBeNull();
    fireEvent.input(opacityInput!, { target: { value: TEST_OPACITY } });

    // copy color with opacity
    fireEvent.click(buttons[colorFormat as ColorFormat]);
    copiedText = await globalThis.navigator.clipboard.readText();

    expect(copiedText).toBe(COPY_TEST_VALUES_WITH_OPACITY[colorFormat]);

    unmount();
  });

describe.concurrent("App test", () => {
  describe.concurrent("Parsing colors", () => {
    for (const format of FORMATS) {
      makeParsingTest(format);
    }
  });

  describe.concurrent("Copying colors", () => {
    for (const format of FORMATS) {
      makeCopyTest(format);
    }
  });
});
