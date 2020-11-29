import { isClass } from "./Component";
import { notEmpty } from "./utils";

// Internal component that can be mounted, unmounted.
// Its instance is called "internal instance".
// It is different from user-specified component, in which the instance is called
// "public instance".
export interface InternalComponent {
    mount(): Node | null | undefined;
    unmount(): void;
}

// Instantiate internal component
export function instantiateComponent(element: React.ReactNode): InternalComponent | null {
    if (element == null || typeof element === 'boolean') {
        return null;
    }

    if (typeof element === 'string' || typeof element === 'number') {
        return new TextComponent(element);
    }

    const type = typeof (element as any).type;
    switch (type) {
        case 'string':
            return new HostComponent(element as React.ReactHTMLElement<any>);
        case 'function':
            return new CompositeComponent(element as React.ReactComponentElement<any>);
        default:
            return null;
    }
}


class TextComponent implements InternalComponent {
    currentElement: React.ReactText;
    node: Node | null;

    constructor(element: React.ReactText) {
        this.currentElement = element;
        this.node = null;
    }

    getPublicInstance() {
        return this.node;
    }

    mount() {
        const node = document.createTextNode(this.currentElement.toString());
        this.node = node;
        return node;
    }

    unmount() {
        this.node = null;
    }
}

const filteredProps = new Set(['__self', '__source', 'children']);

class HostComponent implements InternalComponent {
    currentElement: React.ReactHTMLElement<any>;
    node: Node | null;
    renderedChildren: InternalComponent[];

    constructor(element: React.ReactHTMLElement<any>) {
        this.currentElement = element;
        this.renderedChildren = [];
        this.node = null;
    }

    mount() {
        const { type, props } = this.currentElement;

        const node = document.createElement(type);
        this.node = node;

        Object.keys(props).forEach(propName => {
            if (propName === 'className') {
                if (props[propName])
                    node.setAttribute('class', props[propName]!);
            }
            else if (!filteredProps.has(propName)) {
                node.setAttribute(propName, (props as any)[propName]);
            }
        })

        let children = props.children || [];
        if (!Array.isArray(children)) {
            children = [children];
        }

        const renderedChildren = (children as React.ReactElement[]).map(instantiateComponent).filter(notEmpty);
        this.renderedChildren = renderedChildren;

        renderedChildren
            .map(child => child.mount())
            .filter(notEmpty)
            .forEach(childNode =>
                node.append(childNode)
            )

        return node;
    }

    unmount() {
        // Unmount all the children
        const renderedChildren = this.renderedChildren;
        renderedChildren.forEach(child => child.unmount());

        // TODO: remove event listeners and clears some caches.
    }
}

// Internal wrapper for Class component and functional component
class CompositeComponent implements InternalComponent {
    currentElement: React.ReactComponentElement<any>;
    renderedComponent: InternalComponent | null;
    publicInstance: any;

    constructor(element: React.ReactComponentElement<any>) {
        this.currentElement = element;
        this.renderedComponent = null;
        this.publicInstance = null;
    }

    getPublicInstance() {
        // Return the user-specified instance.
        return this.getPublicInstance;
    }

    mount() {
        const element = this.currentElement
        const { type, props } = element;

        let renderedElement;
        let publicInstance;
        if (isClass(type)) {
            // ClassComponent
            publicInstance = new type(props);
            publicInstance.props = props;
            invokeLifeCycle(publicInstance, 'componentWillMount');
            renderedElement = publicInstance.render();
        } else {
            // FunctionComponent
            publicInstance = null;
            renderedElement = type(props);
        }

        this.publicInstance = publicInstance;

        // Instantiate the child internal instance according to the element.
        const renderedComponent = instantiateComponent(renderedElement);
        this.renderedComponent = renderedComponent;
        return renderedComponent?.mount();
    }

    unmount() {
        const publicInstance = this.publicInstance;
        if (publicInstance) {
            invokeLifeCycle(publicInstance, 'componentWillUnmount');
        }

        const renderedComponent = this.renderedComponent;
        renderedComponent?.unmount();
    }
}

function invokeLifeCycle(obj: any, name: string, ...args: any[]) {
    obj[name] && obj[name].apply(obj, args);
}
