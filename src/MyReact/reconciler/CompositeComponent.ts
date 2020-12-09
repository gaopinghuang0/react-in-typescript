import { isClass } from "../core/Component";
import { instantiateComponent } from "./instantiateComponent";
import { InternalComponent } from "./InternalComponent";
import { EmptyComponent } from "./EmptyComponent";
import { shouldUpdateComponent } from "./shouldUpdateComponent";
import Reconciler from './Reconciler'
import { InstanceMap } from "./InstanceMap";
import { assert } from "../utils/assert";

const _sharedEmptyComponent = new EmptyComponent();

// Credit: adapted from https://reactjs.org/docs/implementation-notes.html

// Internal wrapper for Class component and functional component
export class CompositeComponent implements InternalComponent {
    _currentElement: React.ReactComponentElement<any>;
    _renderedComponent: InternalComponent;
    _publicInstance: any;
    _pendingStateQueue: object[] | null;
    _pendingElement: React.ReactComponentElement<any> | null;

    constructor(element: React.ReactComponentElement<any>) {
        this._currentElement = element;
        this._renderedComponent = _sharedEmptyComponent;
        this._publicInstance = null;
        this._pendingStateQueue = null;
        this._pendingElement = null;
    }

    getPublicInstance() {
        // Return the user-specified instance.
        return this._publicInstance;
    }

    mount() {
        const element = this._currentElement;
        const { type, props } = element;

        let renderedElement;
        let publicInstance;
        if (isClass(type)) {
            // Class Component
            publicInstance = new type(props);
            publicInstance.props = props;

            // Store a reference from the instance back to the internal representation
            InstanceMap.set(publicInstance, this);

            invokeLifeCycle(publicInstance, 'componentWillMount');
            renderedElement = publicInstance.render();
        } else {
            // Functional Component
            publicInstance = null;
            renderedElement = type(props);
        }

        this._publicInstance = publicInstance;

        // Instantiate the child internal instance according to the element.
        const renderedComponent = instantiateComponent(renderedElement);
        this._renderedComponent = renderedComponent;
        const node = Reconciler.mountComponent(renderedComponent);

        if (publicInstance) {
            invokeLifeCycle(publicInstance, 'componentDidMount');
        }

        return node;
    }

    unmount() {
        const publicInstance = this._publicInstance;
        if (publicInstance) {
            invokeLifeCycle(publicInstance, 'componentWillUnmount');
        }

        const renderedComponent = this._renderedComponent;
        Reconciler.unmountComponent(renderedComponent);
    }

    receive(nextElement: React.ReactComponentElement<any>) {
        const prevElement = this._currentElement;

        this._pendingElement = null;

        this.updateComponent(
            prevElement,
            nextElement,
        )
    }

    getHostNode() {
        // Ask the rendered component to provide it.
        // This will recursively drill down any composites.
        return this._renderedComponent.getHostNode();
    }

    performUpdateIfNecessary() {
        if (this._pendingStateQueue !== null) {
            this.updateComponent(this._currentElement, this._currentElement);
        }
    }

    updateComponent(
        prevParentElement: React.ReactComponentElement<any>,
        nextParentElement: React.ReactComponentElement<any>
    ) {
        const instance = this._publicInstance;
        assert(instance != null, `Attempted to update component ${this.getName()} that has` +
            ` already been unmounted (or failed to mount).`)

        let willReceive = false;
        // Not a simple state update but a props update
        if (prevParentElement !== nextParentElement) {
            willReceive = true;
        }

        const nextProps = nextParentElement.props;
        if (willReceive && instance.componentWillReceiveProps) {
            invokeLifeCycle(instance, 'componentWillReceiveProps', nextProps);
        }

        const nextState = this._processPendingState(nextProps);

        let shouldUpdate = true;
        if (instance.shouldComponentUpdate) {
            shouldUpdate = instance.shouldComponentUpdate(nextProps, nextState);
        } else {
            // TODO: use shallow equal for PureComponent
        }

        if (shouldUpdate) {
            // Will set `this.props`, `this.state`.
            this._performComponentUpdate(
                nextParentElement,
                nextProps,
                nextState,
            )
        } else {
            // If it's determined that a component should not update, we still want
            // to set props and state but we shortcut the rest of the update.
            this._currentElement = nextParentElement;
            instance.props = nextProps;
            instance.state = nextState;
        }

    }

    private _processPendingState(props: any) {
        const instance = this._publicInstance;
        const queue = this._pendingStateQueue;
        this._pendingStateQueue = null;

        if (!queue) {
            return instance.state;
        }

        const nextState = Object.assign({}, instance.state);
        queue.forEach(partialState => {
            Object.assign(
                nextState,
                typeof partialState === 'function'
                    ? partialState.call(instance, nextState, props)
                    : partialState
            );
        })

        return nextState;
    }

    private _performComponentUpdate(
        nextElement: React.ReactComponentElement<any>,
        nextProps: any,
        nextState: any,
    ) {
        const instance = this._publicInstance;

        let hasComponentDidUpdate = Boolean(instance.componentDidUpdate);
        let prevProps;
        let prevState;
        if (hasComponentDidUpdate) {
            prevProps = instance.props;
            prevState = instance.state;
        }

        if (instance.componentWillUpdate) {
            invokeLifeCycle(instance, 'componentWillUpdate', nextProps, nextState);
        }

        this._currentElement = nextElement;
        instance.props = nextProps;
        instance.state = nextState;

        this._updateRenderedComponent(nextElement);

        invokeLifeCycle(instance, 'componentDidUpdate', prevProps, prevState);
    }

    /**
   * Call the component's `render` method and update the DOM accordingly.
     */
    _updateRenderedComponent(nextElement: React.ReactComponentElement<any>) {
        // const prevPros = this.currentElement.props;
        const prevRenderedComponent = this._renderedComponent;
        const prevRenderedElement = prevRenderedComponent._currentElement;

        const type = nextElement.type;
        const nextProps = nextElement.props;

        // Figure out what the next render() output is
        let nextRenderedElement;
        if (isClass(type)) {
            // Class Component
            const publicInstance = this._publicInstance;
            publicInstance.props = nextProps;
            // Re-render
            nextRenderedElement = publicInstance.render();
        } else if (typeof type === 'function') {
            // Functional Component
            nextRenderedElement = type(nextProps);
        }

        // If the rendered element type has not changed,
        // reuse the existing component instance and exit.
        if (shouldUpdateComponent(prevRenderedElement, nextRenderedElement)) {
            Reconciler.receiveComponent(prevRenderedComponent, nextRenderedElement);
            return;
        }

        // If we reached this point, we need to unmount the previously
        // mounted component, mount the new one, and swap their nodes.
        const prevNode = prevRenderedComponent.getHostNode();

        // Unmount the old child and mount a new child
        Reconciler.unmountComponent(prevRenderedComponent);
        const nextRenderedComponent = instantiateComponent(nextRenderedElement);
        const nextNode = Reconciler.mountComponent(nextRenderedComponent);

        this._renderedComponent = nextRenderedComponent;

        prevNode?.parentNode?.replaceChild(nextNode, prevNode);
    }

    /**
     * Get a text description of the component that can be used to identify it
     * in error messages.
     * @return {string} The name or null.
     * @internal
     */
    getName() {
        var type = this._currentElement.type;
        var constructor = this._publicInstance && this._publicInstance.constructor;
        return (
            type.displayName ||
            (constructor && constructor.displayName) ||
            type.name ||
            (constructor && constructor.name) ||
            null
        );
    }

}

function invokeLifeCycle(obj: any, name: string, ...args: any[]) {
    obj[name] && obj[name].apply(obj, args);
}
