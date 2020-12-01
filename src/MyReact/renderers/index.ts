

import HostComponent from "../reconciler/HostComponent";
import { DOMComponent } from "./DOMComponent";
import { render } from "./DOMRenderer";


// Do the injection here
HostComponent.inject(DOMComponent);

export {
    render,
}