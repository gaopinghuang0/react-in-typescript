
const filteredProps = new Set(['key', 'ref', '__self', '__source']);

export function createElement(type: string, config: any, ...args: React.ReactElement[]): React.ReactElement {
    // filter out some internal props
    const props: { [key: string]: any } = {};

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
    return { type, key, props }
}
