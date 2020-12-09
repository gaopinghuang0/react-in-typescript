/**
 * Given a `prevElement` and `nextElement`, determines if the existing
 * instance should be updated as opposed to being destroyed or replaced by a new
 * instance. Both arguments are elements. This ensures that this logic can
 * operate on stateless trees without any backing instance.
 *
 * It is called "shouldUpdateComponent" in React, but it actually checks Elements.
 */
export function shouldUpdateElement(prevElement: any, nextElement: any) {
    var prevEmpty = prevElement === null || prevElement === false;
    var nextEmpty = nextElement === null || nextElement === false;
    if (prevEmpty || nextEmpty) {
        return prevEmpty === nextEmpty;
    }

    var prevType = typeof prevElement;
    var nextType = typeof nextElement;
    if (prevType === 'string' || prevType === 'number') {
        return nextType === 'string' || nextType === 'number';
    } else {
        return (
            nextType === 'object' &&
            prevElement.type === nextElement.type &&
            prevElement.key === nextElement.key
        );
    }
}