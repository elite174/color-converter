import {
  Component,
  createMemo,
  onMount,
  createEffect,
  onCleanup,
} from "solid-js";
import { createStore } from "solid-js/store";

import { InputWrapper } from "./components/InputWrapper";
import { Icon } from "./components/Icon";

import {
  hexStringToOpacity,
  hexToRgb,
  hslToHex,
  normalizeHex,
  opacityToHex,
  rgbToHex,
  rgbToHsl,
  roundOpacityString,
} from "./utils/converters";
import {
  hslToInputString,
  hslToString,
  rgbToInputString,
  rgbToString,
} from "./utils/formatters";

import { DEFAULT_OPACITY, GITHUB_LINK } from "./constants";
import type { RGB } from "./types";

import styles from "./App.module.scss";

const hexRegExp = /^#((?<h6>[\da-f]{6})|(?<h3>[\da-f]{3}))\s*$/i;
const rgbRegExp = /^(?<r>\d{1,3})\s*,\s*(?<g>\d{1,3})\s*,\s*(?<b>\d{1,3})\s*$/i;
const hslRegExp =
  /^(?<h>\d{1,3})\s*,\s*(?<s>\d{1,3})%\s*,\s*(?<l>\d{1,3})%\s*$/i;

/**
 * These expressions also validate the input
 */
const clipboardHexRegExp =
  /#(((?<h6>[\da-f]{6})(?<o>[\da-f]{2})?)|(?<h3>[\da-f]{3}))\s*/i;
const clipboardRGBRegExp =
  /(rgb\((?<r>[\d]{1,3})\s*,\s*(?<g>[\d]{1,3})\s*,\s*?(?<b>[\d]{1,3})\))|(rgba\((?<ra>[\d]{1,3})\s*,\s*(?<ga>[\d]{1,3})\s*,\s*?(?<ba>[\d]{1,3})\s*(?:,|\/)\s*(?<o>(?:0\.\d+)|(?:1))\))/i;
const clipboardHSLRegExp =
  /(hsl\((?<h>[\d]{1,3})\s*,\s*(?<s>[\d]{1,3})%\s*,\s*(?<l>[\d]{1,3})%\))|(hsla\((?<ha>[\d]{1,3})\s*,\s*(?<sa>[\d]{1,3})%\s*,\s*(?<la>[\d]{1,3})%\s*(?:,|\/)\s*(?<o>(?:0\.\d+)|(?:1))\))/i;

const resetCopyStateTime = 3000;

const App: Component = () => {
  let hexInputRef: HTMLInputElement | undefined;
  let rgbInputRef: HTMLInputElement | undefined;
  let hslInputRef: HTMLInputElement | undefined;

  let shouldOverwriteInputData = false;

  const [state, setState] = createStore(
    {
      hexColor: "#ffffff",
      valid: true,
      opacity: DEFAULT_OPACITY,
    },
    { name: "Store" }
  );

  const normalizedHex = createMemo(() => normalizeHex(state.hexColor));
  const rgbColor = createMemo(() => hexToRgb(normalizedHex()));
  const hslColor = createMemo(() => {
    const rgb = rgbColor();

    if (!rgb) return null;

    return rgbToHsl(...rgb);
  });

  createEffect(() => {
    if (!state.valid) return;

    const activeInput = document.activeElement;

    if (
      hexInputRef &&
      (shouldOverwriteInputData || hexInputRef !== activeInput)
    )
      hexInputRef.value = state.hexColor;
    if (
      rgbInputRef &&
      (shouldOverwriteInputData || rgbInputRef !== activeInput)
    ) {
      const rgb = rgbColor();

      if (rgb) {
        rgbInputRef.value = rgbToInputString(rgb);
      }
    }
    if (
      hslInputRef &&
      (shouldOverwriteInputData || hslInputRef !== activeInput)
    ) {
      const hsl = hslColor();

      if (hsl) {
        hslInputRef.value = hslToInputString(hsl);
      }
    }
  });

  const [copyState, setCopyState] = createStore(
    {
      rgb: false,
      hex: false,
      hsl: false,
    },
    { name: "CopyStore" }
  );

  const processRGB = (
    text: string,
    regExp: RegExp,
    shouldSetError: boolean
  ): boolean => {
    shouldOverwriteInputData = !shouldSetError;

    const matchResult = text.match(regExp);

    if (!matchResult?.groups) {
      if (shouldSetError) setState({ valid: false });

      return false;
    }

    const rgbArray = [
      Number(matchResult.groups.r ?? matchResult.groups.ra),
      Number(matchResult.groups.g ?? matchResult.groups.ga),
      Number(matchResult.groups.b ?? matchResult.groups.ba),
    ] satisfies RGB;

    if (rgbArray.some((val) => val > 255)) {
      if (shouldSetError) setState({ valid: false });

      return true;
    }

    setState({
      valid: true,
      hexColor: rgbToHex(...rgbArray),
      opacity: roundOpacityString(matchResult.groups.o),
    });

    return true;
  };

  const processHEX = (
    text: string,
    regExp: RegExp,
    setError: boolean
  ): boolean => {
    shouldOverwriteInputData = !setError;

    const matchResult = text.match(regExp);

    if (matchResult?.groups) {
      const hex = `#${(
        matchResult.groups.h6 ?? matchResult.groups.h3
      ).toLowerCase()}`;

      setState({
        hexColor: hex,
        opacity: hexStringToOpacity(matchResult.groups.o),
        valid: true,
      });

      return true;
    } else if (setError) setState({ valid: false });

    return false;
  };

  const processHSL = (
    text: string,
    regExp: RegExp,
    shouldSetError: boolean
  ): boolean => {
    shouldOverwriteInputData = !shouldSetError;

    const matchResult = text.match(regExp);

    if (!matchResult?.groups) {
      if (shouldSetError) setState({ valid: false });

      return false;
    }

    const [h, s, l] = [
      Number(matchResult.groups.h ?? matchResult.groups.ha),
      Number(matchResult.groups.s ?? matchResult.groups.sa),
      Number(matchResult.groups.l ?? matchResult.groups.la),
    ];

    if (h > 359 || s > 100 || l > 100) {
      if (shouldSetError) setState({ valid: false });

      return true;
    }

    setState({
      valid: true,
      hexColor: hslToHex([h, s, l]),
      opacity: roundOpacityString(matchResult.groups.o),
    });

    return true;
  };

  onMount(() => {
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();

      const clipboardText = e.clipboardData?.getData("text");

      if (!clipboardText) return;

      processHEX(clipboardText, clipboardHexRegExp, false) ||
        processRGB(clipboardText, clipboardRGBRegExp, false) ||
        processHSL(clipboardText, clipboardHSLRegExp, false);
    };

    document.addEventListener("paste", handlePaste, { capture: true });

    onCleanup(() => document.removeEventListener("paste", handlePaste));
  });

  const resetCopyState = (key: keyof typeof copyState) => {
    setCopyState(key, false);
  };

  const handleHexCopy = () => {
    navigator.clipboard
      .writeText(normalizedHex() + opacityToHex(state.opacity))
      .then(() => setCopyState({ hex: true }))
      .then(() => setTimeout(() => resetCopyState("hex"), resetCopyStateTime));
  };

  const handleRGBCopy = () => {
    const currentRGB = rgbColor();

    if (!currentRGB) return;

    navigator.clipboard
      .writeText(rgbToString(currentRGB, state.opacity))
      .then(() => setCopyState({ rgb: true }))
      .then(() => setTimeout(() => resetCopyState("rgb"), resetCopyStateTime));
  };

  const handleHSLCopy = () => {
    const currentHSL = hslColor();

    if (!currentHSL) return;

    navigator.clipboard
      .writeText(hslToString(currentHSL, state.opacity))
      .then(() => setCopyState({ hsl: true }))
      .then(() => setTimeout(() => resetCopyState("hsl"), resetCopyStateTime));
  };

  return (
    <main class={styles.container}>
      <a class={styles.githubLink} href={GITHUB_LINK} target="_blank">
        <Icon name="github" class={styles.githubIcon} />
      </a>
      <h1 class={styles.title}>Paste color anywhere!</h1>
      <label class={styles.colorContainer}>
        <div
          class={styles.colorSquare}
          style={{
            "background-color": normalizedHex(),
            opacity: state.opacity,
          }}
        ></div>
        <input
          type="color"
          value={normalizedHex()}
          class={styles.colorInput}
          onInput={(e) =>
            setState({ hexColor: e.currentTarget.value, valid: true })
          }
        />
      </label>
      <div class={styles.inputs} classList={{ [styles.error]: !state.valid }}>
        <InputWrapper
          title={
            <span>
              Opacity: <b class={styles.opacityValue}>{state.opacity}</b>
            </span>
          }
          class={styles.inputWrapper}
        >
          <input
            value={state.opacity}
            onInput={(e) => setState({ opacity: +e.currentTarget.value })}
            type="range"
            min="0"
            max="1"
            step="0.01"
          />
        </InputWrapper>
        <InputWrapper title="HEX" class={styles.inputWrapper}>
          <input
            ref={hexInputRef}
            onInput={(e) => processHEX(e.currentTarget.value, hexRegExp, true)}
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
            ref={rgbInputRef}
            type="text"
            onInput={(e) => processRGB(e.currentTarget.value, rgbRegExp, true)}
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
        <InputWrapper title="HSL" class={styles.inputWrapper}>
          <input
            ref={hslInputRef}
            type="text"
            onInput={(e) => processHSL(e.currentTarget.value, hslRegExp, true)}
          />
          <button
            class={styles.iconButton}
            onClick={handleHSLCopy}
            title="Copy HSL color"
          >
            <Icon
              name={copyState.hsl ? "check" : "clipboard"}
              class={styles.icon}
            />
          </button>
        </InputWrapper>
      </div>
      <p class={styles.hint}>
        Copied color will be automatically formatted with opacity (if any)
      </p>
    </main>
  );
};

export default App;
