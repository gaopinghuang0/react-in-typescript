import { isClass } from "../core/Component";
import { instantiateComponent } from "./instantiateComponent";
import { InternalComponent } from "./InternalComponent";
import { EmptyComponent } from "./EmptyComponent";

const _sharedEmptyComponent = new EmptyComponent();

// Internal wrapper for Class component and functional component
export class CompositeComponent implements InternalComponent {
    currentElement: React.ReactComponentElement<any>;
    renderedComponent: InternalComponent;
    publicInstance: any;

    constructor(element: React.ReactComponentElement<any>) {
        this.currentElement = element;
        this.renderedComponent = _sharedEmptyComponent;
        this.publicInstance = null;
    }

    getPublicInstance() {
        // Return the user-specified instance.
        return this.getPublicInstance;
    }

    mount() {
        const element = this.currentElement;
        const { type, props } = element;

        let renderedElement;
        let publicInstance;
        if (isClass(type)) {
            // Class Component
            publicInstance = new type(props);
            publicInstance.props = props;
            invokeLifeCycle(publicInstance, 'componentWillMount');
            renderedElement = publicInstance.render();
        } else {
            // Functional Component
            publicInstance = null;
            renderedElement = type(props);
        }

        this.publicInstance = publicInstance;

        // Instantiate the child internal instance according to the element.
        const renderedComponent = instantiateComponent(renderedElement);
        this.renderedComponent = renderedComponent;
        return renderedComponent.mount();
    }

    unmount() {
        const publicInstance = this.publicInstance;
        if (publicInstance) {
            invokeLifeCycle(publicInstance, 'componentWillUnmount');
        }

        const renderedComponent = this.renderedComponent;
        renderedComponent.unmount();
    }

    // Do "virtual DOM diffing"
    receive(nextElement: React.ReactComponentElement<any>) {
        const prevPros = this.currentElement.props;
        const publicInstance = this.publicInstance;
        const prevRenderedComponent = this.renderedComponent;
        const prevRenderedElement = prevRenderedComponent.currentElement;

        // Update own element
        this.currentElement = nextElement;
        const type = nextElement.type;
        const nextProps = nextElement.props;

        // Figure out what the next render() output is
        let nextRenderedElement;
        if (isClass(type)) {
            // Class Component
            invokeLifeCycle(publicInstance, 'componentWillUpdate', nextProps);
            publicInstance.props = nextProps;
            // Re-render
            nextRenderedElement = publicInstance.render();
        } else if (typeof type === 'function') {
            // Functional Component
            nextRenderedElement = type(nextProps);
        }

        // If the rendered element type has not changed,
        // reuse the existing component instance and exit.
        if (prevRenderedElement && typeof prevRenderedElement === 'object') {
            if ((prevRenderedElement as React.ReactElement).type === nextRenderedElement.type) {
                prevRenderedComponent.receive(nextRenderedElement);
                return;
            }
        } else {

        }


    }
}

function invokeLifeCycle(obj: any, name: string, ...args: any[]) {
    obj[name] && obj[name].apply(obj, args);
}
