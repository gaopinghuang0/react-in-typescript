

export interface ReactHostElement {
    type: string,
    props: any
}

export interface ReactCompositeElement {
    type: Function,
    props: any
}

export type ReactElement = ReactHostElement | ReactCompositeElement;

export function createElement(type: string, config: any, ...args: ReactElement[]): ReactElement {
    const props = Object.assign({}, config);
    const children = [...args];
    props.children = children;

    return {
        type,
        props
    }
}
