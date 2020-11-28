
class Component<P = {}, S = {}> {
    isReactComponent = true;
    readonly props: Readonly<P> & Readonly<{ children?: React.ReactNode }>;
    context: any;
    refs: {
        [key: string]: React.ReactInstance
    };
    state: {};

    constructor(props: Readonly<P> | P) {
        this.props = props;
        // this.state = S;
        this.state = {};
        this.refs = {};
    }

    setState<K extends keyof S>(
        state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
    ) { };

    forceUpdate(callback?: () => void) { };

    render() {
        throw new Error('must implement render method');
    }
}
Component.prototype.isReactComponent = true;

export function isClass(type: any) {
    return (
        Boolean(type.prototype) &&
        Boolean(type.prototype.isReactComponent)
    )
}

export default Component;