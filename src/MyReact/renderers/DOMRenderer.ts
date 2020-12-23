import { assert } from "../utils/assert";
import { instantiateComponent } from "../reconciler/instantiateComponent";
import { InternalComponent } from "../reconciler/InternalComponent";
import Reconciler from '../reconciler/Reconciler'
import { shouldUpdateElement } from "../reconciler/shouldUpdateElement";
import { Component } from "../core/Component";
import { createElement } from "../core/ReactElement";
import ReactUpdates from "../reconciler/ReactUpdates";
import ReconcileTransaction from "../transactions/ReconcileTransaction";
import UpdateQueue from "../reconciler/UpdateQueue";
import { CompositeComponent } from "../reconciler/CompositeComponent";

const ROOT_KEY = "MyReactRootKey";
let rootID = 1;

// Used to track root instances.
interface RootInstanceMap {
    [key: string]: InternalComponent
}
const instancesByRootID: RootInstanceMap = {};

function isRoot(node: HTMLElement) {
    return !!node.dataset[ROOT_KEY];
}

/**
 * Add a component-like wrapper to the root element 
 * so that the instantiated root component will always be CompositeComponent,
 * rather than any other possible types of InternalComponent (DOMComponent, EmptyComponent).
 * This greatly simplifies the type casting and also stores all top-level pending updates
 * in a composite component.
 */
class TopLevelWrapper extends Component {
    isReactComponent = true;

    render() {
        return this.props.children;
    }
}

export function render(nextElement: React.ReactNode, container: HTMLElement | null | undefined) {
    if (container == null) return;

    // Wrap an element with type React.ReactNode into an React.ReactComponentElement
    const nextWrappedElement = createElement(
        TopLevelWrapper,
        null,
        nextElement
    ) as React.ReactComponentElement<any>;

    // First check if we've already rendered into this node.
    // If so, we'll be doing an update.
    // Otherwise we'll assume this is an initial render.
    let instance: Component;
    if (isRoot(container)) {
        instance = update(nextWrappedElement, container);
    } else {
        instance = mount(nextWrappedElement, container);
    }

    return instance;
}

function mountComponentIntoContainer(
    internalInstance: InternalComponent,
    container: HTMLElement,
    transaction: ReconcileTransaction
) {
    const node = Reconciler.mountComponent(internalInstance, transaction, container);
    container.appendChild(node);
}

function batchedMountComponentIntoContainer(
    internalInstance: InternalComponent,
    container: HTMLElement
) {
    const transaction = new ReactUpdates.ReconcileTransaction!();
    transaction.perform(
        mountComponentIntoContainer,
        null,
        internalInstance,
        container,
        transaction,
    )
}

function mount(nextElement: React.ReactComponentElement<any>, container: HTMLElement) {
    // Root component will be CompositeComponent since the root element is wrapped earlier.
    const rootComponent = instantiateComponent(nextElement) as CompositeComponent;

    // The initial render is synchronous but any updates that happen during
    // rendering, in componentWillMount or componentDidMount, will be batched
    // according to the current batching strategy.
    ReactUpdates.batchedUpdates(
        batchedMountComponentIntoContainer,
        rootComponent,
        container,
    )

    saveInternalInstanceToNode(container, rootComponent);

    const publicInstance = rootComponent._renderedComponent.getPublicInstance();
    return publicInstance;
}

function update(nextElement: React.ReactComponentElement<any>, container: HTMLElement) {
    // Ensure we have a valid root node
    assert(container && isRoot(container));

    const prevRootComponent = getInternalInstanceFromNode(container) as CompositeComponent;
    const prevElement = prevRootComponent._currentElement;

    if (shouldUpdateElement(prevElement, nextElement)) {
        UpdateQueue.enqueueElementInternal(
            prevRootComponent,
            nextElement,
        )
        return prevRootComponent._renderedComponent.getPublicInstance();
    } else {
        // Unmount and then mount a new one
        unmount(container);
        return mount(nextElement, container);
    }
}

export function unmount(container: HTMLElement) {
    assert(
        isValidContainer(container),
        'unmount(...): Target container is not a DOM element.',
    );

    // Ensure we have a valid root node
    assert(container && isRoot(container));

    const rootComponent = getInternalInstanceFromNode(container);

    Reconciler.unmountComponent(rootComponent);

    removeChildren(container);
    delete container.dataset[ROOT_KEY];
}

function saveInternalInstanceToNode(node: HTMLElement, internalInstance: InternalComponent) {
    // Mark this node as root
    node.dataset[ROOT_KEY] = rootID.toString();
    instancesByRootID[rootID] = internalInstance;

    // Incrememnt rootID so we can track appropriately.
    rootID++;
}

function getInternalInstanceFromNode(node: HTMLElement) {
    assert(node && isRoot(node));
    // Find the internal instance by id;
    const id = node.dataset[ROOT_KEY];
    return instancesByRootID[id!];
}

function removeChildren(node: HTMLElement) {
    // [].slice.call(node.childNodes).forEach(node.removeChild, node);
    node.innerHTML = '';
}


const ELEMENT_NODE_TYPE = 1;
const DOC_NODE_TYPE = 9;
const DOCUMENT_FRAGMENT_NODE_TYPE = 11;

/**
 * True if the supplied DOM node is a valid node element.
 *
 * @param {?DOMElement} node The candidate DOM node.
 * @return {boolean} True if the DOM is a valid DOM node.
 * @internal
 */
function isValidContainer(node?: HTMLElement) {
    return !!(
        node &&
        (node.nodeType === ELEMENT_NODE_TYPE ||
            node.nodeType === DOC_NODE_TYPE ||
            node.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)
    );
}
