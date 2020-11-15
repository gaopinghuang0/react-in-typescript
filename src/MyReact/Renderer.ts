import { ReactElement, ReactHostElement, ReactComponentElement, ReactText } from "./types";


export const render = (element: ReactElement | ReactText, container: Node | null | undefined) => {
    if (container == null) return;

    // For the first time, mount the element, otherwise update.
    mount(element, container);
}

function mount(element: ReactElement | ReactText, container: Node) {
    const node = instantiateComponent(element);
    container.appendChild(node);
}

function instantiateComponent(element: ReactElement | ReactText): Node {
    if (typeof element === 'string' || typeof element === 'number') {
        return createText(element);
    }

    const type = typeof element.type;
    switch (type) {
        case 'string':
            return createHostElement(element as ReactHostElement);
        default:
            return createCompositeElement(element as ReactComponentElement);
    }
}

function createText(element: ReactText): Node {
    return document.createTextNode(element.toString());
}

function createHostElement(element: ReactHostElement): Node {
    const { type, props } = element;

    const node = document.createElement(type);
    Object.keys(props).forEach(propName => {
        if (propName !== 'children') {
            node.setAttribute(propName, props[propName]);
        }
    })

    const children = props.children;
    if (Array.isArray(children)) {
        children.forEach(childElement => {
            if (childElement && typeof childElement !== 'boolean') {
                const childNode = instantiateComponent(childElement);
                node.appendChild(childNode);
            }
        })
    }

    return node;
}

function createCompositeElement(element: ReactComponentElement): Node {
    const node = element.type(element.props);
    return node;
}