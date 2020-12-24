import { DOMComponent } from "../renderers/DOMComponent";
import { InternalComponent } from "./InternalComponent";


export class TextComponent implements InternalComponent {
    _currentElement: React.ReactText;
    _hostNode: Text | null;
    _hostParent: DOMComponent | null;  // the parent component instance
    _domID: number;

    constructor(element: React.ReactText) {
        this._currentElement = element;
        this._hostNode = null;
        this._hostParent = null;
        this._domID = 0;
    }

    getPublicInstance() {
        return this._hostNode;
    }

    getHostNode(): Text | null {
        return this._hostNode;
    }

    mount() {
        const node = document.createTextNode(this._currentElement.toString());
        this._hostNode = node;
        return node;
    }

    unmount() {
        this._hostNode = null;
    }

    receive(nextElement: React.ReactText) {
        this._currentElement = nextElement;
        if (this._hostNode) {
            this._hostNode.textContent = nextElement.toString();
        }
    }
}
