import { ReactComponentElement, ReactHostElement, ReactNodeList, ReactText } from "./types";


export const render = (element: ReactNodeList, container: Node | null | undefined) => {
    if (container == null) return;

    // For the first time, mount the element, otherwise update.
    mount(element, container);
}

function mount(element: ReactNodeList, container: Node) {
    renderElement(element, container);
}

function renderElement(element: ReactNodeList, container: Node) {
    if (element == null || typeof element === 'boolean') {
        return;
    }
    if (typeof element === 'string' || typeof element === 'number') {
        return renderText(element, container);
    }

    const type = typeof (element as any).type;
    switch (type) {
        case 'string':
            return renderHostElement(element as ReactHostElement, container);
        case 'function':
            return renderCompositeElement(element as ReactComponentElement, container);
        default:
            return;
    }
}

function renderText(element: ReactText, container: Node) {
    const node = document.createTextNode(element.toString());
    container.appendChild(node);
}

function renderHostElement(element: ReactHostElement, container: Node) {
    const { type, props } = element;

    const node = document.createElement(type);
    Object.keys(props).forEach(propName => {
        if (propName === 'className') {
            if (props[propName])
                node.setAttribute('class', props[propName]!);
        }
        else if (propName !== 'children') {
            node.setAttribute(propName, props[propName]);
        }
    })

    const children = props.children;
    if (Array.isArray(children)) {
        children.forEach(childElement => {
            renderElement(childElement, node);
        })
    } else {
        renderElement(children, node);
    }

    container.appendChild(node);
}

function renderCompositeElement(element: ReactComponentElement, container: Node) {
    const elem = element.type(element.props);
    renderElement(elem, container);
}
