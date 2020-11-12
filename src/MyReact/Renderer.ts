import { ReactCompositeElement, ReactElement, ReactHostElement } from "./ReactElement";


export const render = (element: ReactElement | string, container: Node | null | undefined) => {
    if (container == null) return;

    // For the first time, mount the element, otherwise update.
    mount(element, container);
}

function mount(element: ReactElement | string, container: Node) {
    const node = instantiateComponent(element);
    container.appendChild(node);
}

function instantiateComponent(element: ReactElement | string): Node {
    if (typeof element === 'string') {
        return createText(element);
    }

    const type = typeof element.type;
    switch (type) {
        case 'string':
            return createHostElement(element as ReactHostElement);
        default:
            return createCompositeElement(element as ReactCompositeElement);
    }
}

function createText(element: string): Node {
    return document.createTextNode(element);
}

function createHostElement(element: ReactHostElement): Node {
    const node = document.createElement(element.type);
    return node;
}

function createCompositeElement(element: ReactCompositeElement): Node {
    const node = element.type(element.props);
    return node;
}