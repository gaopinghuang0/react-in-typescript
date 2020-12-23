import { CompositeComponent } from "./CompositeComponent";

var ReactNodeTypes = require('ReactNodeTypes');

export function getHostComponentFromComposite(inst: CompositeComponent) {
    var type;

    while ((type = inst._renderedNodeType) === ReactNodeTypes.COMPOSITE) {
        inst = inst._renderedComponent as CompositeComponent;
    }

    if (type === ReactNodeTypes.HOST) {
        return inst._renderedComponent;
    } else if (type === ReactNodeTypes.EMPTY) {
        return null;
    }
    return null;
}
