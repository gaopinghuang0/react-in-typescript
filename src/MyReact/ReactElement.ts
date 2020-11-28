
export function createElement(type: string, config: any, ...args: React.ReactElement[]): React.ReactElement {
    const props = Object.assign({}, config);
    const key = props.key || null;
    let children;
    if (args.length === 1) {
        children = args[0];
    } else {
        children = args;
    }
    props.children = children;
    return { type, key, props }
}
