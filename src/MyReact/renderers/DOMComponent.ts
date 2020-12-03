import ChildReconciler from "../reconciler/ChildReconciler";
import { instantiateComponent } from "../reconciler/instantiateComponent";
import { InternalComponent } from "../reconciler/InternalComponent";
import Reconciler from "../reconciler/Reconciler";

// Credit: adapted from https://reactjs.org/docs/implementation-notes.html
export class DOMComponent implements InternalComponent {
    currentElement: React.ReactHTMLElement<any>;
    node: HTMLElement | null;
    renderedChildren: InternalComponent[];

    constructor(element: React.ReactHTMLElement<any>) {
        this.currentElement = element;
        this.renderedChildren = [];
        this.node = null;
    }

    getHostNode(): HTMLElement | null {
        return this.node;
    }

    mount() {
        const { type, props } = this.currentElement;

        const node = document.createElement(type);
        this.node = node;

        this.setAttributes(node, props);

        let children = props.children || [];
        if (!Array.isArray(children)) {
            children = [children];
        }

        const renderedChildren = (children as React.ReactElement[]).map(instantiateComponent);
        this.renderedChildren = renderedChildren;

        renderedChildren
            .map(child => Reconciler.mountComponent(child))
            .forEach(childNode => node.append(childNode));

        return node;
    }

    unmount() {
        // Unmount all the children
        const renderedChildren = this.renderedChildren;
        renderedChildren.forEach(child => Reconciler.unmountComponent(child));

        // TODO: remove event listeners and clears some caches.
    }

    // Do "virtual DOM diffing"
    receive(nextElement: React.ReactHTMLElement<any>) {
        const prevElement = this.currentElement;
        const prevProps = prevElement.props;
        const nextProps = nextElement.props;
        this.currentElement = nextElement;

        this.updateDomProperties(prevProps, nextProps);
        this.updateChildren(prevProps, nextProps);
    }

    private setAttributes(node: HTMLElement | null, props: React.AllHTMLAttributes<any>) {
        if (!node) return;

        Object.keys(props).forEach(propName => {
            if (propName === 'className') {
                if (props[propName])
                    node.setAttribute('class', props[propName]!);
            }
            else if (propName !== 'children') {
                node.setAttribute(propName, (props as any)[propName]);
            }
        });
    }

    private removeAttributes(node: HTMLElement | null, props: React.AllHTMLAttributes<any>) {
        if (!node) return;

        Object.keys(props).forEach(propName => {
            if (propName === 'className') {
                if (props[propName])
                    node.removeAttribute('class');
            }
            else if (propName !== 'children') {
                node.removeAttribute(propName);
            }
        });
    }

    private updateDomProperties(prevProps: React.AllHTMLAttributes<any>, nextProps: React.AllHTMLAttributes<any>) {
        // Remove old attributes.
        this.removeAttributes(this.node, prevProps);
        // Set next attributes.
        this.setAttributes(this.node, nextProps);
    }

    private updateChildren(prevProps: React.AllHTMLAttributes<any>, nextProps: React.AllHTMLAttributes<any>) {
        // These are arrays of React elements:
        let _prevChildren = prevProps.children || [];
        if (!Array.isArray(_prevChildren)) {
            _prevChildren = [_prevChildren];
        }
        const prevChildren = (_prevChildren as React.ReactElement[])

        let _nextChildren = nextProps.children || [];
        if (!Array.isArray(_nextChildren)) {
            _nextChildren = [_nextChildren];
        }
        const nextChildren = (_nextChildren as React.ReactElement[])

        // These are arrays of internal instances:
        var prevRenderedChildren = this.renderedChildren;
        var nextRenderedChildren: InternalComponent[] = [];

        // As we iterate over children, we will add operations to the array.
        var operationQueue: any[] = [];

        ChildReconciler.updateChildren(
            prevChildren,
            nextChildren,
            prevRenderedChildren,
            nextRenderedChildren,
            operationQueue
        )

        // Point the list of rendered children to the updated version.
        this.renderedChildren = nextRenderedChildren;

        // Process the operation queue.
        this.processOperationQueue(operationQueue);
    }

    private processOperationQueue(operationQueue: any[]) {
        while (operationQueue.length > 0) {
            let operation = operationQueue.shift();
            switch (operation.type) {
                case 'ADD':
                    this.node?.appendChild(operation.node);
                    break;
                case 'REPLACE':
                    this.node?.replaceChild(operation.nextNode, operation.prevNode);
                    break;
                case 'REMOVE':
                    this.node?.removeChild(operation.node);
                    break;
            }
        }
    }
}