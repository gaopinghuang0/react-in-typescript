import { assert } from "../utils/assert";
import { instantiateComponent } from "./instantiateComponent";
import { InternalComponent } from "./InternalComponent";
import Reconciler from './Reconciler'
import { shouldUpdateComponent } from "./shouldUpdateComponent";

const ROOT_KEY = "MyReactRootKey";
let rootID = 1;

// Used to track root instances.
interface InstanceMap {
    [key: string]: InternalComponent
}
const instancesByRootID: InstanceMap = {};

function isRoot(node: HTMLElement) {
    return !!node.dataset[ROOT_KEY];
}

export const render = (element: React.ReactNode, container: HTMLElement | null | undefined) => {
    if (container == null) return;

    // First check if we've already rendered into this node.
    // If so, we'll be doing an update.
    // Otherwise we'll assume this is an initial render.
    if (isRoot(container)) {
        update(element, container);
    } else {
        mount(element, container);
    }
}

function mount(element: React.ReactNode, container: HTMLElement) {
    const rootComponent = instantiateComponent(element);

    saveInternalInstanceToNode(container, rootComponent);

    const node = Reconciler.mountComponent(rootComponent, container);
    container.appendChild(node);
}

function update(element: React.ReactNode, container: HTMLElement) {
    // Ensure we have a valid root node
    assert(container && isRoot(container));

    // Destroy any existing tree
    const prevRootComponent = getInternalInstanceFromNode(container);
    const prevElement = prevRootComponent.currentElement;

    if (shouldUpdateComponent(prevElement, element)) {
        Reconciler.receiveComponent(prevRootComponent, element);
        return;
    } else {
        // Unmount and then mount a new one
        unmount(container);
        mount(element, container);
    }
}

function unmount(container: HTMLElement) {
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
