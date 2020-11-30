
// Internal component that can be mounted, unmounted.
// Its instance is called "internal instance".
// It is different from user-specified component, in which the instance is called
// "public instance".
export interface InternalComponent {
    receive(nextElement: React.ReactNode): void;
    currentElement: React.ReactNode,
    mount(): Node;
    unmount(): void;
    getHostNode(): Node | null;
}

