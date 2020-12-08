import { InternalComponent } from "./InternalComponent";


export class EmptyComponent implements InternalComponent {
    _currentElement: null;

    constructor() {
        this._currentElement = null;
    }
    getPublicInstance() {
        throw new Error("Method not implemented.");
    }
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
