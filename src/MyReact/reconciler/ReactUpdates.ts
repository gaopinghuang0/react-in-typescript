import { InternalComponent } from "./InternalComponent";
import Reconciler from "./Reconciler";

const ReactUpdates = {
    enqueueUpdate(internalInstance: InternalComponent) {

        // TODO: batch update
        // For now, just update it.
        Reconciler.performUpdateIfNecessary(internalInstance);
    }
}

export default ReactUpdates;
