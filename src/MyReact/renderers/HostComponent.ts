import { instantiateComponent } from "./instantiateComponent";
import { InternalComponent } from "./InternalComponent";

const filteredProps = new Set(['__self', '__source', 'children']);
export class HostComponent implements InternalComponent {
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
        });

        let children = props.children || [];
        if (!Array.isArray(children)) {
            children = [children];
        }

        const renderedChildren = (children as React.ReactElement[]).map(instantiateComponent);
        this.renderedChildren = renderedChildren;

        renderedChildren
            .map(child => child.mount())
            .forEach(childNode => node.append(childNode));

        return node;
    }

    unmount() {
        // Unmount all the children
        const renderedChildren = this.renderedChildren;
        renderedChildren.forEach(child => child.unmount());

        // TODO: remove event listeners and clears some caches.
    }

    // Do "virtual DOM diffing"
    receive(nextElement: React.ReactHTMLElement<any>) {
    }
}
