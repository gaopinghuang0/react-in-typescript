
import * as MyReact from "..";
import { CompositeComponent } from "../reconciler/CompositeComponent";
import { getHostComponentFromComposite } from "../reconciler/getHostComponentFromComposite";
import { InstanceMap } from "../reconciler/InstanceMap";
import { assert } from "../utils/assert";
import { DOMComponent } from "./DOMComponent";
import DOMComponentTree from "./DOMComponentTree";

/**
 * Returns the DOM node rendered by this element.
 *
 * See https://facebook.github.io/react/docs/top-level-api.html#reactdom.finddomnode
 */
export function findDOMNode(componentOrElement: MyReact.Component | HTMLElement): React.ReactNode {

    if (componentOrElement == null) {
        return null;
    }
    if ((componentOrElement as HTMLElement).nodeType === 1) {
        return componentOrElement;
    }

    let inst = InstanceMap.get(componentOrElement as MyReact.Component) || null;
    if (inst) {
        inst = getHostComponentFromComposite(inst as CompositeComponent);
        return inst ? DOMComponentTree.getNodeFromInstance(inst as DOMComponent) : null;
    }

    if (typeof (componentOrElement as MyReact.Component).render === 'function') {
        assert(false, 'findDOMNode was called on an unmounted component.');
    } else {
        assert(
            false,
            `Element appears to be neither ReactComponent nor DOMNode ` +
            `(keys: ${Object.keys(componentOrElement)})`,
        );
    }
}

