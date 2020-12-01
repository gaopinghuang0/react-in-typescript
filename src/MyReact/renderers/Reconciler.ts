import { InternalComponent } from "./InternalComponent";


const Reconciler = {
    mountComponent(component: InternalComponent, container?: HTMLElement): Node {
        // For now, just return mount
        return component.mount();
    },
    unmountComponent(component: InternalComponent) {
        component.unmount();
    },
    receiveComponent(component: InternalComponent, nextElement: React.ReactNode) {
        component.receive(nextElement);
    },
}

export default Reconciler;