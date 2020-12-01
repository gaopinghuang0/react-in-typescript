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

        Object.keys(props).forEach(propName => {
            if (propName === 'className') {
                if (props[propName])
                    node.setAttribute('class', props[propName]!);
            }
            else if (propName !== 'children') {
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

    private updateDomProperties(prevProps: React.AllHTMLAttributes<any>, nextProps: React.AllHTMLAttributes<any>) {
        // Remove old attributes.
        Object.keys(prevProps).forEach(propName => {
            if (propName !== 'children' && !nextProps.hasOwnProperty(propName)) {
                this.node?.removeAttribute(propName);
            }
        });
        // Set next attributes.
        Object.keys(nextProps).forEach(propName => {
            if (propName !== 'children') {
                this.node?.setAttribute(propName, (nextProps as any)[propName]);
            }
        });
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
        var nextRenderedChildren = [];

        // As we iterate over children, we will add operations to the array.
        var operationQueue: any[] = [];

        // Note: the section below is extremely simplified!
        // It doesn't handle reorders, children with holes, or keys.
        // It only exists to illustrate the overall flow, not the specifics.

        for (var i = 0; i < nextChildren.length; i++) {
            // Try to get an existing internal instance for this child
            let prevChild = prevRenderedChildren[i];

            // If there is no internal instance under this index,
            // a child has been appended to the end. Create a new
            // internal instance, mount it, and use its node.
            if (!prevChild) {
                let nextChild = instantiateComponent(nextChildren[i]);
                let node = Reconciler.mountComponent(nextChild);

                // Record that we need to append a node
                operationQueue.push({ type: 'ADD', node });
                nextRenderedChildren.push(nextChild);
                continue;
            }

            // We can only update the instance if its element's type matches.
            // For example, <Button size="small" /> can be updated to
            // <Button size="large" /> but not to an <App />.
            const canUpdate = prevChildren[i].type === nextChildren[i].type;

            // If we can't update an existing instance, we have to unmount it
            // and mount a new one instead of it.
            if (!canUpdate) {
                let prevNode = prevChild.getHostNode();
                Reconciler.unmountComponent(prevChild);

                let nextChild = instantiateComponent(nextChildren[i]);
                let nextNode = Reconciler.mountComponent(nextChild);

                // Record that we need to swap the nodes
                operationQueue.push({ type: 'REPLACE', prevNode, nextNode });
                nextRenderedChildren.push(nextChild);
                continue;
            }

            // If we can update an existing internal instance,
            // just let it receive the next element and handle its own update.
            Reconciler.receiveComponent(prevChild, nextChildren[i]);
            nextRenderedChildren.push(prevChild);
        }

        // Finally, unmount any children that don't exist:
        for (var j = nextChildren.length; j < prevChildren.length; j++) {
            let prevChild = prevRenderedChildren[j];
            let node = prevChild.getHostNode();
            Reconciler.unmountComponent(prevChild);

            // Record that we need to remove the node
            operationQueue.push({ type: 'REMOVE', node });
        }

        // Point the list of rendered children to the updated version.
        this.renderedChildren = nextRenderedChildren;

        // Process the operation queue.
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