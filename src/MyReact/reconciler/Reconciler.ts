import { InternalComponent } from "./InternalComponent";

/**
 * The Reconciler acts as the decorator for InternalComponent's mount(), unmount(),
 * receive(). For example, it helps register event listeners.
 */
const Reconciler = {
    mountComponent(internalInstance: InternalComponent, container?: HTMLElement): Node {
        // For now, just return mount
        return internalInstance.mount();
    },
    unmountComponent(internalInstance: InternalComponent) {
        internalInstance.unmount();
    },
    // It is called "receiveComponent" in React, but it actually receives Element.
    receiveElement(internalInstance: InternalComponent, nextElement: React.ReactNode) {
        const prevElement = internalInstance._currentElement;

        if (nextElement === prevElement) {
            // There is no need to update the same element.
            console.log("Early stop!");
            return;
        }
        internalInstance.receive(nextElement);
    },
    performUpdateIfNecessary(internalInstance: InternalComponent) {
        internalInstance.performUpdateIfNecessary();
    }
}

export default Reconciler;