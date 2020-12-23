
let MyReact;  // These three things are referring to the same file.
let ReactDOM;
let ReactMount;
let ReactTestUtils;

// Credit: adopted from React/src/renderers/dom/client/__tests__/ReactMount-test.js
describe('DOMRenderer', () => {
    beforeEach(() => {
        jest.resetModuleRegistry();

        MyReact = require('../..');
        ReactDOM = MyReact;
        ReactMount = MyReact;
        ReactTestUtils = require('../../utils/ReactTestUtils').default;
    });

    describe('unmountComponentAtNode', () => {
        it('throws when given a non-node', () => {
            var nodeArray = document.getElementsByTagName('div');
            expect(function () {
                ReactDOM.unmount(nodeArray);
            }).toThrowError(
                'unmount(...): Target container is not a DOM element.',
            );
        });
    });

    // it('throws when given a string', () => {
    //     expect(function () {
    //         ReactTestUtils.renderIntoDocument('div');
    //     }).toThrowError(
    //         'ReactDOM.render(): Invalid component element. Instead of passing a ' +
    //         "string like 'div', pass React.createElement('div') or <div />.",
    //     );
    // });

    it('should render different components in same root', () => {
        var container = document.createElement('container');
        document.body.appendChild(container);

        ReactMount.render(<div />, container);
        expect(container.firstChild.nodeName).toBe('DIV');

        ReactMount.render(<span />, container);
        expect(container.firstChild.nodeName).toBe('SPAN');
    });

    it('should unmount and remount if the key changes', () => {
        var container = document.createElement('container');

        var mockMount = jest.fn();
        var mockUnmount = jest.fn();

        class Component extends MyReact.Component {
            componentDidMount = mockMount;
            componentWillUnmount = mockUnmount;
            render() {
                return <span>{this.props.text}</span>;
            }
        }

        expect(mockMount.mock.calls.length).toBe(0);
        expect(mockUnmount.mock.calls.length).toBe(0);

        ReactMount.render(<Component text="orange" key="A" />, container);
        expect(container.firstChild.innerHTML).toBe('orange');
        expect(mockMount.mock.calls.length).toBe(1);
        expect(mockUnmount.mock.calls.length).toBe(0);

        // If we change the key, the component is unmounted and remounted
        ReactMount.render(<Component text="green" key="B" />, container);
        expect(container.firstChild.innerHTML).toBe('green');
        expect(mockMount.mock.calls.length).toBe(2);
        expect(mockUnmount.mock.calls.length).toBe(1);

        // But if we don't change the key, the component instance is reused
        ReactMount.render(<Component text="blue" key="B" />, container);
        expect(container.firstChild.innerHTML).toBe('blue');
        expect(mockMount.mock.calls.length).toBe(2);
        expect(mockUnmount.mock.calls.length).toBe(1);
    });

    it('should reuse markup if rendering to the same target twice', () => {
        var container = document.createElement('container');
        var instance1 = ReactDOM.render(<div />, container);
        var instance2 = ReactDOM.render(<div />, container);

        expect(instance1 === instance2).toBe(true);
    });

    it('should not warn if mounting into non-empty node', () => {
        var container = document.createElement('container');
        container.innerHTML = '<div></div>';

        jest.spyOn(console, 'error');
        ReactMount.render(<div />, container);
        expect(console.error.mock.calls.length).toBe(0);
    });

})
