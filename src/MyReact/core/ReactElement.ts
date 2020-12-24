import { REACT_ELEMENT_TYPE } from "../utils/ReactElementSymbol";

const filteredProps = new Set(['key', 'ref', '__self', '__source']);

export function createElement(type: any, config: any, ...args: React.ReactNode[]): React.ReactElement {
    // filter out some internal props
    const props: { [key: string]: any } = {};
    config = config || {};

    Object.keys(config).forEach(propName => {
        if (!filteredProps.has(propName)) {
            props[propName] = config[propName];
        }
    });

    const key = config.key || null;
    if (args.length === 1) {
        props.children = args[0];
    } else if (args.length >= 2) {
        props.children = args;
    }
    return { type, key, props, $$typeof: REACT_ELEMENT_TYPE } as React.ReactElement
}
