import UpdateQueue from "../reconciler/UpdateQueue";
// export interface PublicComponent extends React.Component;

type ReactInstance = Component<any> | Element;

//
// Component Specs and Lifecycle
// ----------------------------------------------------------------------

// This should be "infer SS" but can't use it yet
interface NewLifecycle<P, S, SS> {
    /**
     * Runs before React applies the result of `render` to the document, and
     * returns an object to be given to componentDidUpdate. Useful for saving
     * things such as scroll position before `render` causes changes to it.
     *
     * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
     * lifecycle events from running.
     */
    getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
    /**
     * Called immediately after updating occurs. Not called for the initial render.
     *
     * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
     */
    componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
}

// This should actually be something like `Lifecycle<P, S> | DeprecatedLifecycle<P, S>`,
// as React will _not_ call the deprecated lifecycle methods if any of the new lifecycle
// methods are present.
interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS> {
    /**
     * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
     */
    componentDidMount?(): void;
    /**
     * Called to determine whether the change in props and state should trigger a re-render.
     *
     * `Component` always returns true.
     * `PureComponent` implements a shallow comparison on props and state and returns true if any
     * props or states have changed.
     *
     * If false is returned, `Component#render`, `componentWillUpdate`
     * and `componentDidUpdate` will not be called.
     */
    shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
    /**
     * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
     * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
     */
    componentWillUnmount?(): void;
    /**
     * Catches exceptions generated in descendant components. Unhandled exceptions will cause
     * the entire component tree to unmount.
     */
    componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
}

export interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> { }

export class Component<P, S> {
    isReactComponent = true;
    readonly props: Readonly<P> & Readonly<{ children?: React.ReactNode }>;
    context: any;
    refs: {
        [key: string]: React.ReactInstance
    };
    // TODO: add type Pick<S, K> to match the type in setState
    state: Readonly<S>;

    constructor(props: Readonly<P> | P) {
        this.props = props;
        this.state = {} as S;
        this.refs = {};
    }

    setState<K extends keyof S>(
        state: ((prevState: S, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
    ) {
        UpdateQueue.enqueueSetState(this, state);
        if (callback) {
            // TODO:
        }
    }

    forceUpdate(callback?: () => void) {

    }

    render(): React.ReactNode {
        throw new Error('must implement render method');
    }
}
Component.prototype.isReactComponent = true;

// It is not easy to detect if an object is a class.
// However, we only need to check if it is a subclass of React Component.
// Therefore, checking `isReactComponent` is enough.
export function isClass(type: any) {
    return (
        Boolean(type.prototype) &&
        Boolean(type.prototype.isReactComponent)
    )
}
