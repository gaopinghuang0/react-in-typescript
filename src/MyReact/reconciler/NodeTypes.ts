import { assert } from "../utils/assert";
import { isValidElement } from "../utils/isValidElement";

export enum NodeTypes {
    HOST = 0,
    COMPOSITE = 1,
    EMPTY = 2,
}

export function getNodeTypes(node: React.ReactElement): NodeTypes {
    if (node === null) {
        return NodeTypes.EMPTY;
    } else if (isValidElement(node)) {
        if (typeof node.type === 'function') {
            return NodeTypes.COMPOSITE;
        } else {
            return NodeTypes.HOST;
        }
    }
    throw new TypeError(`Unexpected node: ${node}`)
}
