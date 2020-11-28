import { isClass } from "./Component";
import { notEmpty } from "./utils";

// Internal component that can be mounted
interface MountableComponent {
    mount(): Node | null | undefined;
}

export function instantiateComponent(element: React.ReactNode): MountableComponent | null {
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


class TextComponent implements MountableComponent {
    currentElement: React.ReactText;
    node: Node | null;

    constructor(element: React.ReactText) {
        this.currentElement = element;
        this.node = null;
    }

    mount() {
        const node = document.createTextNode(this.currentElement.toString());
        this.node = node;
        return node;
    }
}

const filteredProps = new Set(['__self', '__source', 'children']);

class HostComponent implements MountableComponent {
    currentElement: React.ReactHTMLElement<any>;
    node: Node | null;

    constructor(element: React.ReactHTMLElement<any>) {
        this.currentElement = element;
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

        renderedChildren
            .map(child => child.mount())
            .filter(notEmpty)
            .forEach(childNode =>
                node.append(childNode)
            )

        return node;
    }
}

// Class component and functional component
class CompositeComponent implements MountableComponent {
    currentElement: React.ReactComponentElement<any>;

    constructor(element: React.ReactComponentElement<any>) {
        this.currentElement = element;
    }

    mount() {
        const element = this.currentElement
        const { type, props } = element;

        let renderedElement;
        if (isClass(type)) {
            // ClassComponent
            const instance = new type(props);
            instance.props = props;
            invokeLifeCycle(instance, 'componentWillMount');
            renderedElement = instance.render();
        } else {
            // FunctionComponent
            renderedElement = type(props);
        }

        // Instantiate the child internal instance according to the element.
        const renderedComponent = instantiateComponent(renderedElement);
        return renderedComponent?.mount();
    }
}

function invokeLifeCycle(obj: any, name: string, ...args: any[]) {
    obj[name] && obj[name].apply(obj, args);
}
