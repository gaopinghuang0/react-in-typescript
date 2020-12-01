import { assert } from "../utils/assert";
import { instantiateComponent } from "./instantiateComponent";
import { InternalComponent } from "./InternalComponent";
import Reconciler from './Reconciler'

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

    // For the first time, mount the element, otherwise update.
    mount(element, container);
}

function mount(element: React.ReactNode, container: HTMLElement) {
    // Destroy any existing tree
    if (container.firstChild) {
        const prevRootComponent = getInternalInstanceFromNode(container);
        const prevElement = prevRootComponent.currentElement;

        if (prevElement && typeof prevElement === 'object') {
            if ((prevElement as React.ReactElement).type === (element as React.ReactElement).type) {
                prevRootComponent.receive(element);
                return;
            }
        }

        unmount(container);
    }

    const rootComponent = instantiateComponent(element);

    saveInternalInstanceToNode(container, rootComponent);

    const node = Reconciler.mountComponent(rootComponent, container);
    container.appendChild(node);
}

function unmount(container: HTMLElement) {
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
