import { Component } from "..";
import { CompositeComponent } from "./CompositeComponent";
import { InstanceMap } from "./InstanceMap";
import ReactUpdates from "./ReactUpdates";

const UpdateQueue = {

    enqueueSetState<
        P,
        S,
        K extends keyof S>(publicInstance: Component<P, S>,
            partialState: ((prevState: S, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null)) {
        // This is where React would do queueing, storing a series
        // of partialStates. The Updater would apply those in a batch later.

        const internalInstance = InstanceMap.get(publicInstance) as CompositeComponent;
        if (!internalInstance || partialState == null) return;

        const queue =
            internalInstance._pendingStateQueue ||
            (internalInstance._pendingStateQueue = []);
        queue.push(partialState as object);

        ReactUpdates.enqueueUpdate(internalInstance);
    },

    enqueueElementInternal(
        internalInstance: CompositeComponent,
        nextElement: React.ReactComponentElement<any>
    ) {
        internalInstance._pendingElement = nextElement;

        ReactUpdates.enqueueUpdate(internalInstance);
    }
};

export default UpdateQueue;