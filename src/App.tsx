import {
  Component,
  createMemo,
  createSignal,
  JSX,
  onMount,
  runWithOwner,
} from "solid-js";
import { createStore } from "solid-js/store";

import { InputWrapper } from "./components/InputWrapper";
import { colors } from "./constants";
import type { RGB } from "./types";
import { getBestContrastColor } from "./utils/contrast";
import { hexToRgb, rgbToHex } from "./utils/converters";
import { Icon } from "./components/Icon";

import styles from "./App.module.scss";
import { rgbToString } from "./utils/formatters";
import { getOwner } from "solid-js/web";
import { Owner } from "solid-js/types/reactive/signal";

const hexRegExp = /^#([0-9a-f]{3}){1,2}$/i;
const rgbRegExp = /^([0-9]{1,3}),([0-9]{1,3}),([0-9]{1,3})$/i;

const clipboardHexRegExp = /#([0-9a-f]{3}){1,2}/i;
const clipboardRGBRegExp =
  /rgb\(([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*?([0-9]{1,3})\)/i;

const resetCopyStateTime = 3000;

const App: Component = () => {
  const [hexInputValue, setHexInputValue] = createSignal("#ffffff");
  const [state, setState] = createStore({
    hexColor: "#ffffff",
    valid: true,
  });
  const [copyState, setCopyState] = createStore({
    rgb: false,
    hex: false,
  });

  const processRGB = (text: string, regExp: RegExp, setError: boolean) => {
    const rgb = text.match(regExp);

    if (!rgb) {
      if (setError) setState({ valid: false });

      return;
    }

    const rgbArray = rgb.slice(1, 4).map(Number) as RGB;

    if (rgbArray.some((val) => val > 255)) {
      if (setError) setState({ valid: false });
      return;
    }

    setState({ valid: true, hexColor: rgbToHex(...rgbArray) });
  };

  const processHEX = (
    text: string,
    regExp: RegExp,
    setError: boolean
  ): boolean => {
    const hexMatch = text.match(regExp);

    if (hexMatch) {
      setState({ hexColor: hexMatch[0].toLowerCase(), valid: true });

      return true;
    } else if (setError) setState({ valid: false });

    return false;
  };

  const handleHexInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    e
  ) => {
    setHexInputValue(e.currentTarget.value);

    processHEX(e.currentTarget.value, hexRegExp, true);
  };

  const rgbInputHandler: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    e
  ) => processRGB(e.currentTarget.value, rgbRegExp, true);

  const rgbColor = createMemo(() => hexToRgb(state.hexColor));

  const owner = getOwner();

  onMount(() => {
    document.addEventListener(
      "paste",
      (e) => {
        e.preventDefault();

        const clipboardText = e.clipboardData?.getData("text");

        if (!clipboardText) return;

        processHEX(clipboardText, clipboardHexRegExp, false) ||
          processRGB(clipboardText, clipboardRGBRegExp, false);

        runWithOwner(owner as Owner, () => {
          if (state.hexColor !== hexInputValue()) {
            setHexInputValue(state.hexColor);
          }
        });
      },
      { capture: true }
    );
  });

  const resetCopyState = (key: keyof typeof copyState) => {
    setCopyState(key, false);
  };

  const handleHexCopy = () => {
    navigator.clipboard
      .writeText(state.hexColor)
      .then(() => setCopyState({ hex: true }))
      .then(() => setTimeout(() => resetCopyState("hex"), resetCopyStateTime));
  };

  const handleRGBCopy = () => {
    const currentRGB = rgbColor();

    if (!currentRGB) return;

    navigator.clipboard
      .writeText(rgbToString(currentRGB))
      .then(() => setCopyState({ rgb: true }))
      .then(() => setTimeout(() => resetCopyState("rgb"), resetCopyStateTime));
  };

  return (
    <main class={styles.container}>
      <h1 class={styles.title}>Color converter</h1>
      <div
        style={{
          "background-color": state.hexColor,
        }}
        class={styles.colorSquare}
      >
        <span
          class={styles.text}
          style={{
            color: getBestContrastColor(
              colors.dark,
              colors.light,
              state.hexColor
            ),
          }}
        >
          {state.hexColor}
        </span>
      </div>
      <div class={styles.inputs} classList={{ [styles.error]: !state.valid }}>
        <InputWrapper title="HEX" class={styles.inputWrapper}>
          <input
            onInput={handleHexInput}
            value={hexInputValue()}
            type="text"
            placeholder="Type hex color"
          />
          <button
            class={styles.iconButton}
            onClick={handleHexCopy}
            title="Copy hex color"
          >
            <Icon
              name={copyState.hex ? "check" : "clipboard"}
              class={styles.icon}
            />
          </button>
        </InputWrapper>
        <InputWrapper title="RGB" class={styles.inputWrapper}>
          <input
            value={rgbColor()?.toString()}
            type="text"
            onInput={rgbInputHandler}
          />
          <button
            class={styles.iconButton}
            onClick={handleRGBCopy}
            title="Copy RGB color"
          >
            <Icon
              name={copyState.rgb ? "check" : "clipboard"}
              class={styles.icon}
            />
          </button>
        </InputWrapper>
      </div>
      <p class={styles.hint}>Paste color anywhere</p>
    </main>
  );
};

export default App;
