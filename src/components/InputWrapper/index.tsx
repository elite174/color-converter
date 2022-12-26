import { JSX, ParentComponent } from "solid-js";

import styles from "./InputWrapper.module.css";

interface Props {
  class?: string;
  title: JSX.Element;
}

export const InputWrapper: ParentComponent<Props> = (props) => (
  <label class={styles.container} classList={{ [props.class ?? ""]: true }}>
    <span class={styles.text}>{props.title}</span>
    {props.children}
  </label>
);
