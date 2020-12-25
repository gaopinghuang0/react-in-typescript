import { Component } from "./Component";


/**
 * This is the abstract API for an update queue.
 */
const NoopUpdateQueue = {
    enqueueCallback: (publicInstance: Component, callback: any, callerName?: string) => { },
    enqueueSetState: (publicInstance: Component, partialState: any) => { },
    enqueueForceUpdate: (publicInstance: Component) => { },
    enqueueReplaceState: (publicInstance: Component, completeState: object) => { },
};

export default NoopUpdateQueue;
