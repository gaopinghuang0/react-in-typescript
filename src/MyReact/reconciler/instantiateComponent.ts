import { InternalComponent } from "./InternalComponent";
import { EmptyComponent } from "./EmptyComponent";
import { TextComponent } from "./TextComponent";
import { CompositeComponent } from "./CompositeComponent";
import HostComponent from "./HostComponent";

// Instantiate internal component
export function instantiateComponent(element: React.ReactNode): InternalComponent {
    if (element == null || typeof element === 'boolean') {
        return new EmptyComponent();
    }

    if (typeof element === 'string' || typeof element === 'number') {
        return new TextComponent(element);
    }

    const type = typeof (element as any).type;
    switch (type) {
        case 'string':
            // Platform-specific components
            return HostComponent.construct(element as React.ReactHTMLElement<any>);
        case 'function':
            // User-defined components
            return new CompositeComponent(element as React.ReactComponentElement<any>);
        default:
            throw new Error(`Encountered invalid React node of type ${typeof element}`)
    }
}
