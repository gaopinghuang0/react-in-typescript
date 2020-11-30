import { InternalComponent } from "./InternalComponent";


export class TextComponent implements InternalComponent {
    currentElement: React.ReactText;
    node: Node | null;

    constructor(element: React.ReactText) {
        this.currentElement = element;
        this.node = null;
    }

    getPublicInstance() {
        return this.node;
    }

    mount() {
        const node = document.createTextNode(this.currentElement.toString());
        this.node = node;
        return node;
    }

    unmount() {
        this.node = null;
    }

    // Do "virtual DOM diffing"
    receive(nextElement: React.ReactText) {
    }
}
