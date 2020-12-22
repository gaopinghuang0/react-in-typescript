
// Internal component that can be mounted, unmounted.
// Its instance is called "internal instance".
// It is different from user-specified component, in which the instance is called

import ReconcileTransaction from "../transactions/ReconcileTransaction";

// "public instance".
export interface InternalComponent {
    getPublicInstance(): any;
    receive(nextElement: React.ReactNode, transaction: ReconcileTransaction): void;
    _currentElement: React.ReactNode,
    mount(transaction: ReconcileTransaction): Node;
    unmount(): void;
    getHostNode(): Node | null;
}

