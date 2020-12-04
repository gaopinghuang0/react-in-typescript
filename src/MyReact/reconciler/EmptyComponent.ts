import { InternalComponent } from "./InternalComponent";


export class EmptyComponent implements InternalComponent {
    currentElement: null;

    constructor() {
        this.currentElement = null;
    }
    toJSON(): void { }
    mount(): Node {
        return document.createComment('Empty Node');
    }
    getHostNode(): Node | null {
        return null;
    }
    unmount(): void { }
    receive(nextElement: any) { }
    performUpdateIfNecessary(): void {
        throw new Error("Method not implemented.");
    }
}
