import { InternalComponent } from "./InternalComponent";


export class TextComponent implements InternalComponent {
    _currentElement: React.ReactText;
    node: Text | null;

    constructor(element: React.ReactText) {
        this._currentElement = element;
        this.node = null;
    }

    getPublicInstance() {
        return this.node;
    }

    getHostNode(): Text | null {
        return this.node;
    }

    mount() {
        const node = document.createTextNode(this._currentElement.toString());
        this.node = node;
        return node;
    }

    unmount() {
        this.node = null;
    }

    // Do "virtual DOM diffing"
    receive(nextElement: React.ReactText) {
        this._currentElement = nextElement;
        if (this.node) {
            this.node.textContent = nextElement.toString();
        }
    }
    performUpdateIfNecessary(): void {
        throw new Error("Method not implemented.");
    }
}
