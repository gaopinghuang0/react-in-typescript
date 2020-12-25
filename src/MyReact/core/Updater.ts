import { Component } from "..";

export interface Updater {
    enqueueCallback: (publicInstance: Component, callback: any, callerName?: string) => void;
    enqueueSetState: (publicInstance: Component, partialState: any) => void;
    enqueueForceUpdate: (publicInstance: Component) => void;
    enqueueReplaceState: (publicInstance: Component, completeState: object) => void;
}