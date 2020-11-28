
export function createElement(type: string, config: any, ...args: React.ReactElement[]): React.ReactElement {
    const props = Object.assign({}, config);
    const key = props.key || null;
    const children = [...args];
    props.children = children;
    return { type, key, props }
}
