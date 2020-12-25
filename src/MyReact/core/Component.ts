import UpdateQueue from "../reconciler/UpdateQueue";
import { Updater } from "./Updater";

export class Component<P = {}, S = {}> {
    isReactComponent = true;
    readonly props: Readonly<P> & Readonly<{ children?: React.ReactNode }>;
    context: any;
    refs: {
        [key: string]: React.ReactInstance
    };
    // TODO: add type Pick<S, K> to match the type in setState
    state: Readonly<S>;
    updater: Updater;

    constructor(props: Readonly<P> | P, updater: Updater) {
        this.props = props;
        this.state = {} as S;
        this.refs = {};
        this.updater = updater;
    }

    setState<K extends keyof S>(
        state: ((prevState: S, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
    ) {
        this.updater.enqueueSetState(this, state);
        if (callback) {
            this.updater.enqueueCallback(this, callback, 'setState');
        }
    }

    forceUpdate(callback?: () => void) {
        this.updater.enqueueForceUpdate(this);
        if (callback) {
            this.updater.enqueueCallback(this, callback, 'forceUpdate');
        }
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
