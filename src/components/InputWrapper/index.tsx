import { JSX, ParentComponent } from "solid-js";

import styles from "./InputWrapper.module.css";

interface Props {
  title: JSX.Element;
  class?: string;
  dataTestId?: string;
}

export const InputWrapper: ParentComponent<Props> = (props) => (
  <label
    class={styles.container}
    classList={{ [props.class ?? ""]: true }}
    data-testid={props.dataTestId}
  >
    <span class={styles.text}>{props.title}</span>
    {props.children}
  </label>
);
