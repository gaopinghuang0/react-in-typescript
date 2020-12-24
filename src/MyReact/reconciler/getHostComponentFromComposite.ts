import { CompositeComponent } from "./CompositeComponent";
import { NodeTypes } from "./NodeTypes";


export function getHostComponentFromComposite(inst: CompositeComponent) {
    var type;

    while ((type = inst._renderedNodeType) === NodeTypes.COMPOSITE) {
        inst = inst._renderedComponent as CompositeComponent;
    }

    if (type === NodeTypes.HOST) {
        return inst._renderedComponent;
    } else if (type === NodeTypes.EMPTY) {
        return null;
    }
    return null;
}
