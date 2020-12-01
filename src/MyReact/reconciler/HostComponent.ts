/**
 * Use injection to inject real implementation.
 */
import { assert } from "../utils/assert";
import { InternalComponent } from "./InternalComponent";

// To avoid typescript warning, we add an extra interface here.
// https://www.typescriptlang.org/docs/handbook/interfaces.html#difference-between-the-static-and-instance-sides-of-classes
export interface HostComponentConstructor {
    new(element: React.ReactHTMLElement<any>): InternalComponent;
}

let implementation: HostComponentConstructor;

function createInternalInstance(
    ctor: HostComponentConstructor,
    element: React.ReactHTMLElement<any>
): InternalComponent {
    return new ctor(element);
}

const HostComponent = {

    construct(element: React.ReactHTMLElement<any>): InternalComponent {
        assert(implementation);

        return createInternalInstance(implementation, element);
    },

    inject(impl: HostComponentConstructor): void {
        implementation = impl;
    }
}

export default HostComponent;
