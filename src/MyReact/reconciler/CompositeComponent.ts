import { isClass } from "../core/Component";
import { instantiateComponent } from "./instantiateComponent";
import { InternalComponent } from "./InternalComponent";
import { EmptyComponent } from "./EmptyComponent";
import { shouldUpdateElement } from "./shouldUpdateElement";
import Reconciler from './Reconciler'
import { InstanceMap } from "./InstanceMap";
import { assert } from "../utils/assert";
import ReconcileTransaction from "../transactions/ReconcileTransaction";
import { getNodeTypes, NodeTypes } from "./NodeTypes";

const _sharedEmptyComponent = new EmptyComponent();

// Credit: adapted from https://reactjs.org/docs/implementation-notes.html

let nextMountID = 1;

// Internal wrapper for Class component and functional component
export class CompositeComponent implements InternalComponent {
    _currentElement: React.ReactComponentElement<any>;
    _renderedComponent: InternalComponent;
    _publicInstance: any;
    _pendingStateQueue: object[] | null;
    _pendingElement: React.ReactComponentElement<any> | null;
    _updateBatchNumber: number | null;
    _renderedNodeType: NodeTypes | null;
    _mountOrder: number;

    constructor(element: React.ReactComponentElement<any>) {
        this._currentElement = element;
        this._renderedComponent = _sharedEmptyComponent;
        this._publicInstance = null;
        this._pendingStateQueue = null;
        this._pendingElement = null;
        this._updateBatchNumber = null;
        this._renderedNodeType = null;
        this._mountOrder = 0;
    }

    getPublicInstance() {
        // Return the user-specified instance.
        return this._publicInstance;
    }

    mount(transaction: ReconcileTransaction) {
        const element = this._currentElement;
        const { type, props } = element;

        this._mountOrder = nextMountID++;

        let renderedElement;
        let publicInstance;
        if (isClass(type)) {
            // Class Component
            publicInstance = new type(props);
            publicInstance.props = props;

            // Store a reference from the instance back to the internal representation
            InstanceMap.set(publicInstance, this);

            let initialState = publicInstance.state;
            if (initialState === undefined) {
                publicInstance.state = initialState = null;
            }
            assert(
                typeof initialState === 'object' && !Array.isArray(initialState),
                `${this.getName()}.state: must be set to an object or null`
            )
        } else {
            // Functional Component
            publicInstance = null;
            renderedElement = type(props);
        }

        this._publicInstance = publicInstance;
        this._pendingStateQueue = null;

        if (publicInstance.componentWillMount) {
            invokeLifeCycle(publicInstance, 'componentWillMount');
            // When mounting, calls to `setState` by `componentWillMount` will set
            // `this._pendingStateQueue` without triggering a re-render.
            if (this._pendingStateQueue) {
                publicInstance.state = this._processPendingState(publicInstance.state);
            }
        }

        if (!renderedElement) {
            renderedElement = publicInstance.render();
        }

        const nodeType = getNodeTypes(renderedElement);
        this._renderedNodeType = nodeType;

        // Instantiate the child internal instance according to the element.
        const child = instantiateComponent(renderedElement);
        this._renderedComponent = child;
        const node = Reconciler.mountComponent(child, transaction);

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

        if (this._renderedComponent) {
            const renderedComponent = this._renderedComponent;
            Reconciler.unmountComponent(renderedComponent);
            this._renderedNodeType = null;
            this._publicInstance = null;
        }

        this._pendingElement = null;
        this._pendingStateQueue = null;

        InstanceMap.delete(publicInstance);
    }

    receive(nextElement: React.ReactComponentElement<any>, transaction: ReconcileTransaction) {
        const prevElement = this._currentElement;

        this._pendingElement = null;

        this.updateComponent(
            transaction,
            prevElement,
            nextElement,
        )
    }

    getHostNode() {
        // Ask the rendered component to provide it.
        // This will recursively drill down any composites.
        return this._renderedComponent.getHostNode();
    }

    performUpdateIfNecessary(transaction: ReconcileTransaction) {
        if (this._pendingElement != null) {
            Reconciler.receiveElement(
                this,
                this._pendingElement,
                transaction,
            )
        }
        else if (this._pendingStateQueue !== null) {
            this.updateComponent(transaction, this._currentElement, this._currentElement);
        } else {
            this._updateBatchNumber = null;
        }
    }

    updateComponent(
        transaction: ReconcileTransaction,
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

        this._updateBatchNumber = null;
        if (shouldUpdate) {
            // Will set `this.props`, `this.state`.
            this._performComponentUpdate(
                nextParentElement,
                nextProps,
                nextState,
                transaction
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
        transaction: ReconcileTransaction,
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

        this._updateRenderedComponent(transaction, nextElement);

        invokeLifeCycle(instance, 'componentDidUpdate', prevProps, prevState);
    }

    /**
   * Call the component's `render` method and update the DOM accordingly.
     */
    _updateRenderedComponent(transaction: ReconcileTransaction, nextElement: React.ReactComponentElement<any>) {
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
        if (shouldUpdateElement(prevRenderedElement, nextRenderedElement)) {
            Reconciler.receiveElement(prevRenderedComponent, nextRenderedElement, transaction);
            return;
        }

        // If we reached this point, we need to unmount the previously
        // mounted component, mount the new one, and swap their nodes.
        const prevNode = prevRenderedComponent.getHostNode();

        // Unmount the old child and mount a new child
        Reconciler.unmountComponent(prevRenderedComponent);
        const nextRenderedComponent = instantiateComponent(nextRenderedElement);
        const nextNode = Reconciler.mountComponent(nextRenderedComponent, transaction);

        this._renderedComponent = nextRenderedComponent;

        prevNode?.parentNode?.replaceChild(nextNode, prevNode);
    }

    /**
     * Get a text description of the component that can be used to identify it
     * in error messages.
     */
    getName(): string | null {
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
