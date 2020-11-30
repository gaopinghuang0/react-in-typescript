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
    getHostNode(): void { }
    unmount(): void { }
    receive(nextElement: any) { }
}
