import { CompositeComponent } from "./CompositeComponent";
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
    receiveComponent(internalInstance: InternalComponent, nextElement: React.ReactNode) {
        const prevElement = internalInstance.currentElement;

        if (nextElement === prevElement) {
            // There is no need to update the same element.
            return;
        }
        internalInstance.receive(nextElement);
    },
    performUpdateIfNecessary(internalInstance: InternalComponent) {
        internalInstance.performUpdateIfNecessary();
    }
}

export default Reconciler;