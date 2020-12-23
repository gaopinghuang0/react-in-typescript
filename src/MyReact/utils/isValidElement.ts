import { REACT_ELEMENT_TYPE } from "./ReactElementSymbol";

export function isValidElement(object: any) {
    return (
        typeof object === 'object' &&
        object !== null &&
        object.$$typeof === REACT_ELEMENT_TYPE
    );
};