import ReconcileTransaction from "../transactions/ReconcileTransaction";
import { instantiateComponent } from "./instantiateComponent";
import { InternalComponent } from "./InternalComponent";
import Reconciler from "./Reconciler";


const ChildReconciler = {
    updateChildren(
        transaction: ReconcileTransaction,
        prevChildren: React.ReactElement[],
        nextChildren: React.ReactElement[],
        prevRenderedChildren: InternalComponent[],
        nextRenderedChildren: InternalComponent[],
        operationQueue: any[]
    ) {
        // Note: the section below is extremely simplified!
        // It doesn't handle reorders, children with holes, or keys.
        // It only exists to illustrate the overall flow, not the specifics.

        for (var i = 0; i < nextChildren.length; i++) {
            // Try to get an existing internal instance for this child
            let prevChild = prevRenderedChildren[i];

            // If there is no internal instance under this index,
            // a child has been appended to the end. Create a new
            // internal instance, mount it, and use its node.
            // Note that prevChildren[i] may be '0' or 0, which are still valid.
            if (prevChildren[i] == null) {
                let nextChild = instantiateComponent(nextChildren[i]);
                let node = Reconciler.mountComponent(nextChild, transaction);

                // Record that we need to append a node
                operationQueue.push({ type: 'ADD', node });
                nextRenderedChildren.push(nextChild);
                continue;
            }

            // We can only update the instance if its element's type matches.
            // For example, <Button size="small" /> can be updated to
            // <Button size="large" /> but not to an <App />.
            const canUpdate = prevChildren[i].type === nextChildren[i].type;

            // If we can't update an existing instance, we have to unmount it
            // and mount a new one instead of it.
            if (!canUpdate) {
                let prevNode = prevChild.getHostNode();
                Reconciler.unmountComponent(prevChild);

                let nextChild = instantiateComponent(nextChildren[i]);
                let nextNode = Reconciler.mountComponent(nextChild, transaction);

                // Record that we need to swap the nodes
                operationQueue.push({ type: 'REPLACE', prevNode, nextNode });
                nextRenderedChildren.push(nextChild);
                continue;
            }

            // If we can update an existing internal instance,
            // just let it receive the next element and handle its own update.
            Reconciler.receiveElement(prevChild, nextChildren[i], transaction);
            nextRenderedChildren.push(prevChild);
        }

        // Finally, unmount any children that don't exist:
        for (var j = nextChildren.length; j < prevChildren.length; j++) {
            let prevChild = prevRenderedChildren[j];
            let node = prevChild.getHostNode();
            Reconciler.unmountComponent(prevChild);

            // Record that we need to remove the node
            operationQueue.push({ type: 'REMOVE', node });
        }
    }
}

export default ChildReconciler;