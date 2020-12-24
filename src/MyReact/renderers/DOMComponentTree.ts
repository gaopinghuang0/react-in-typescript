import { CompositeComponent } from "../reconciler/CompositeComponent";
import { InternalComponent } from "../reconciler/InternalComponent";
import { TextComponent } from "../reconciler/TextComponent";
import { assert } from "../utils/assert";
import { DOMComponent } from "./DOMComponent";
import { DOMComponentFlags } from "./DOMComponentFlags";


const ATTR_NAME = 'data-reactid';
const Flags = DOMComponentFlags;

const internalInstanceKey =
    '__reactInternalInstance$' + Math.random().toString(36).slice(2);

/**
 * Check if a given node should be cached.
 */
function shouldPrecacheNode(node: Node, nodeID: number) {
    return (
        (node.nodeType === 1 && (node as HTMLElement).getAttribute(ATTR_NAME) === String(nodeID)) ||
        (node.nodeType === 8 &&
            node.nodeValue === ' react-text: ' + nodeID + ' ') ||
        (node.nodeType === 8 && node.nodeValue === ' react-empty: ' + nodeID + ' ')
    );
}


/**
 * Drill down (through composites and empty components) until we get a host or
 * host text component.
 *
 * This is pretty polymorphic but unavoidable with the current structure we have
 * for `_renderedChildren`.
 */
function getRenderedHostOrTextFromComponent(component: InternalComponent) {
    var rendered;
    while ((rendered = (component as CompositeComponent)._renderedComponent)) {
        component = rendered;
    }
    return component as DOMComponent;
}

/**
 * Populate `_hostNode` on the rendered host/text component with the given
 * DOM node. The passed `inst` can be a composite.
 */
function precacheNode(inst: InternalComponent, node: Node) {
    var hostInst = getRenderedHostOrTextFromComponent(inst);
    hostInst._hostNode = node;
    (node as any)[internalInstanceKey] = hostInst;
}

/**
 * Populate `_hostNode` on each child of `inst`, assuming that the children
 * match up with the DOM (element) children of `node`.
 *
 * We cache entire levels at once to avoid an n^2 problem where we access the
 * children of a node sequentially and have to walk from the start to our target
 * node every time.
 *
 * Since we update `_renderedChildren` and the actual DOM at (slightly)
 * different times, we could race here and see a newer `_renderedChildren` than
 * the DOM nodes we see. To avoid this, ReactMultiChild calls
 * `prepareToManageChildren` before we change `_renderedChildren`, at which
 * time the container's child nodes are always cached (until it unmounts).
 */
function precacheChildNodes(inst: DOMComponent, node: Node) {
    if (inst._flags & Flags.hasCachedChildNodes) {
        return;
    }
    var children = inst._renderedChildren;
    var childNode = node.firstChild;
    outer: for (var name in children) {
        if (!children.hasOwnProperty(name)) {
            continue;
        }
        var childInst = children[name];
        var childID = getRenderedHostOrTextFromComponent(childInst)._domID;
        if (childID === 0) {
            // We're currently unmounting this child in ReactMultiChild; skip it.
            continue;
        }
        // We assume the child nodes are in the same order as the child instances.
        for (; childNode !== null; childNode = childNode.nextSibling) {
            if (shouldPrecacheNode(childNode, childID)) {
                precacheNode(childInst, childNode);
                continue outer;
            }
        }
        // We reached the end of the DOM children without finding an ID match.
        assert(false, `Unable to find element with ID ${childID}.`);
    }
    inst._flags |= Flags.hasCachedChildNodes;
}

/**
 * Given a ReactDOMComponent or ReactDOMTextComponent, return the corresponding
 * DOM node.
 */
function getNodeFromInstance(inst: DOMComponent) {
    // Without this first invariant, passing a non-DOM-component triggers the next
    // invariant for a missing parent, which is super confusing.
    assert(
        inst._hostNode !== undefined,
        'getNodeFromInstance: Invalid argument.',
    );

    if (inst._hostNode) {
        return inst._hostNode;
    }

    // Walk up the tree until we find an ancestor whose DOM node we have cached.
    const parents: DOMComponent[] = [];
    while (!inst._hostNode) {
        parents.push(inst);
        assert(
            inst._hostParent,
            'React DOM tree root should always have a node reference.',
        );
        inst = inst._hostParent!;
    }

    // Now parents contains each ancestor that does *not* have a cached native
    // node, and `inst` is the deepest ancestor that does.
    for (; parents.length; inst = parents.pop() as DOMComponent) {
        precacheChildNodes(inst, inst._hostNode!);
    }

    return inst._hostNode;
}

const DOMComponentTree = {
    getNodeFromInstance,
}

export default DOMComponentTree;
