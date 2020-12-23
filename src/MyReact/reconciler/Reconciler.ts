import ReconcileTransaction from "../transactions/ReconcileTransaction";
import { CompositeComponent } from "./CompositeComponent";
import { InternalComponent } from "./InternalComponent";

/**
 * The Reconciler acts as the decorator for InternalComponent's mount(), unmount(),
 * receive(). For example, it helps register event listeners.
 */
const Reconciler = {
    mountComponent(
        internalInstance: InternalComponent,
        transaction: ReconcileTransaction,
        container?: HTMLElement
    ): Node {
        // For now, just return mount
        return internalInstance.mount(transaction);
    },

    unmountComponent(internalInstance: InternalComponent) {
        internalInstance.unmount();
    },

    // It is called "receiveComponent" in React, but it actually receives Element.
    receiveElement(
        internalInstance: InternalComponent,
        nextElement: React.ReactNode,
        transaction: ReconcileTransaction,
    ) {
        const prevElement = internalInstance._currentElement;

        if (nextElement === prevElement) {
            // There is no need to update the same element.
            console.log("Early stop!");
            return;
        }
        internalInstance.receive(nextElement, transaction);
    },

    performUpdateIfNecessary(
        internalInstance: CompositeComponent,
        transaction: ReconcileTransaction,
        updateBatchNumber: number
    ) {
        if (internalInstance._updateBatchNumber !== updateBatchNumber) {
            console.warn("Unexpected batch number");
        }

        internalInstance.performUpdateIfNecessary(transaction);
    }
}

export default Reconciler;