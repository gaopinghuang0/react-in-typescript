import { assert } from "./utils";
import { instantiateComponent, InternalComponent } from "./instantiateComponent";

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
        unmount(container);
    }

    const rootComponent = instantiateComponent(element);
    if (!rootComponent) return;

    saveInternalInstanceToNode(container, rootComponent);

    const node = rootComponent.mount();
    if (!node) return;

    container.appendChild(node);
}

function unmount(container: HTMLElement) {
    const rootComponent = getInternalInstanceFromNode(container);

    rootComponent.unmount();

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
