import UpdateQueue from "../reconciler/UpdateQueue";

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
