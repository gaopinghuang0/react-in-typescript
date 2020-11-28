import { instantiateComponent } from "./instantiateComponent";

export const render = (element: React.ReactNode, container: Node | null | undefined) => {
    if (container == null) return;

    // For the first time, mount the element, otherwise update.
    mount(element, container);
}

function mount(element: React.ReactNode, container: Node) {
    const rootComponent = instantiateComponent(element);
    if (!rootComponent) return;
    const node = rootComponent.mount();
    if (!node) return;
    container.appendChild(node);
}
