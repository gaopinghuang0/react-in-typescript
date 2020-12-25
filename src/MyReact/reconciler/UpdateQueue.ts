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

    /**
     * Replaces all of the state. Always use this or `setState` to mutate state.
     * You should treat `this.state` as immutable.
     *
     * There is no guarantee that `this.state` will be immediately updated, so
     * accessing `this.state` after calling this method may return the old value.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @param {object} completeState Next state.
     * @internal
     */
    enqueueReplaceState: function (publicInstance: Component, completeState: object, callback: any) {
        const internalInstance = InstanceMap.get(publicInstance) as CompositeComponent;

        if (!internalInstance) {
            return;
        }

        internalInstance._pendingStateQueue = [completeState];
        internalInstance._pendingReplaceState = true;

        // // Future-proof 15.5
        // if (callback !== undefined && callback !== null) {
        //   if (internalInstance._pendingCallbacks) {
        //     internalInstance._pendingCallbacks.push(callback);
        //   } else {
        //     internalInstance._pendingCallbacks = [callback];
        //   }
        // }

        ReactUpdates.enqueueUpdate(internalInstance);
    },

    enqueueElementInternal(
        internalInstance: CompositeComponent,
        nextElement: React.ReactComponentElement<any>
    ) {
        internalInstance._pendingElement = nextElement;

        ReactUpdates.enqueueUpdate(internalInstance);
    },

    enqueueCallbackInternal(
        internalInstance: CompositeComponent,
        callback: Function
    ) {
        if (internalInstance._pendingCallbacks) {
            internalInstance._pendingCallbacks.push(callback);
        } else {
            internalInstance._pendingCallbacks = [callback];
        }
        ReactUpdates.enqueueUpdate(internalInstance);
    },
};

export default UpdateQueue;