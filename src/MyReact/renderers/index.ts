

import { render, unmount } from "./DOMRenderer";
import { doDefaultInjection } from "./DefaultInjection";

doDefaultInjection();

export {
    render,
    unmount,
}