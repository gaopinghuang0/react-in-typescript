import { ReactElement } from "./types";


export function createElement(type: string, config: any, ...args: ReactElement[]): ReactElement {
    const props = Object.assign({}, config);
    const children = [...args];
    props.children = children;
    return { type, props }
}
