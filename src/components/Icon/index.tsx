import { VoidComponent } from "solid-js";
import iconsSvg from "./icons.svg";

interface Props {
  class?: string;
  name: "clipboard" | 'check';
}

export const Icon: VoidComponent<Props> = (props) => (
  <svg class={props.class}>
    <use href={`${iconsSvg}#${props.name}`}></use>
  </svg>
);
