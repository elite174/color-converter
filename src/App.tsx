import {
  batch,
  Component,
  createMemo,
  createSignal,
  JSX,
  onMount,
} from "solid-js";

import { InputWrapper } from "./components/InputWrapper";
import { colors } from "./constants";
import type { RGB } from "./types";
import { getBestContrastColor } from "./utils/contrast";
import { hexToRgb, rgbToHex } from "./utils/converters";

import styles from "./App.module.css";

const hexRegExp = /^#([0-9a-f]{3}){1,2}$/i;
const rgbRegExp = /^([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3})$/i;

const clipboardHexRegExp = /#([0-9a-f]{3}){1,2}/i;

const App: Component = () => {
  const [hexColor, setHEXColor] = createSignal("#ffffff");
  const [valid, setValid] = createSignal(true);

  const handleHexInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    e
  ) => {
    const inputValue = e.currentTarget.value;

    if (!hexRegExp.test(inputValue)) {
      setValid(false);
      return;
    }

    batch(() => {
      setValid(true);
      setHEXColor(inputValue);
    });
  };

  const rgbInputHandler: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    e
  ) => {
    const inputValue = e.currentTarget.value;

    const rgb = inputValue.match(rgbRegExp);

    if (!rgb) {
      setValid(false);
      return;
    }

    const rgbArray = rgb.slice(1, 4).map(Number) as RGB;

    if (rgbArray.some((val) => val > 255)) {
      setValid(false);
      return;
    }

    batch(() => {
      setValid(true);
      setHEXColor(rgbToHex(...rgbArray));
    });
  };

  const rgbColor = createMemo(() => hexToRgb(hexColor()));

  onMount(() => {
    document.addEventListener(
      "paste",
      (e) => {
        e.preventDefault();

        const clipboardText = e.clipboardData?.getData("text");

        if (!clipboardText) return;

        const hexMatch = clipboardText.match(clipboardHexRegExp);

        if (hexMatch) {
          setHEXColor(hexMatch[0].toLowerCase());

          return;
        }
      },
      { capture: true }
    );
  });

  return (
    <main class={styles.container}>
      <h1 style={{ color: hexColor() }}>Color converter</h1>
      <div
        style={{ "background-color": hexColor() }}
        class={styles.colorSquare}
      >
        <span
          class={styles.text}
          style={{
            color: getBestContrastColor(colors.dark, colors.light, hexColor()),
          }}
        >
          {hexColor()}
        </span>
      </div>
      <div
        class={styles.inputs}
        classList={{ [styles.error]: !valid() }}
        style={{ "--currentColor": hexColor() }}
      >
        <InputWrapper title="HEX" class={styles.inputWrapper}>
          <input
            onInput={handleHexInput}
            value={hexColor()}
            type="text"
            placeholder="Type hex color"
          />
        </InputWrapper>
        <InputWrapper title="RGB" class={styles.inputWrapper}>
          <input
            value={rgbColor()?.toString()}
            type="text"
            onInput={rgbInputHandler}
          />
        </InputWrapper>
      </div>
      <p class={styles.hint}>Paste color anywhere</p>
    </main>
  );
};

export default App;
