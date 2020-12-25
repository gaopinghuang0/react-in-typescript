import { Component } from "..";
import { validateCallback } from "../renderers/validateCallback";
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
    enqueueReplaceState(
        publicInstance: Component,
        completeState: object,
        callback: any
    ) {
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

    /**
     * Forces an update. This should only be invoked when it is known with
     * certainty that we are **not** in a DOM transaction.
     *
     * You may want to call this when you know that some deeper aspect of the
     * component's state has changed but `setState` was not called.
     *
     * This will not invoke `shouldComponentUpdate`, but it will invoke
     * `componentWillUpdate` and `componentDidUpdate`.
     *
     * @param {ReactClass} publicInstance The instance that should rerender.
     * @internal
     */
    enqueueForceUpdate: function (publicInstance: Component) {
        const internalInstance = InstanceMap.get(publicInstance) as CompositeComponent;

        if (!internalInstance) {
            return;
        }

        internalInstance._pendingForceUpdate = true;

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


    /**
     * Enqueue a callback that will be executed after all the pending updates
     * have processed.
     *
     * @param {ReactClass} publicInstance The instance to use as `this` context.
     * @param {?function} callback Called after state is updated.
     * @param {string} callerName Name of the calling function in the public API.
     * @internal
     */
    enqueueCallback(
        publicInstance: Component,
        callback: any,
        callerName: string) {
        validateCallback(callback, callerName);
        const internalInstance = InstanceMap.get(publicInstance) as CompositeComponent;

        // Previously we would throw an error if we didn't have an internal
        // instance. Since we want to make it a no-op instead, we mirror the same
        // behavior we have in other enqueue* methods.
        // We also need to ignore callbacks in componentWillMount. See
        // enqueueUpdates.
        if (!internalInstance) {
            return null;
        }

        if (internalInstance._pendingCallbacks) {
            internalInstance._pendingCallbacks.push(callback);
        } else {
            internalInstance._pendingCallbacks = [callback];
        }

        ReactUpdates.enqueueUpdate(internalInstance);
    },
};

export default UpdateQueue;