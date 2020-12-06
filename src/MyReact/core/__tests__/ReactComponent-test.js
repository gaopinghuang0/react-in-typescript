
let MyReact;

// Credit: adopted from React/src/__tests__/ReactES6Class-test.js
describe('ReactES6Class', () => {
    let Inner;
    let container;
    let attachedListener = null;
    let renderedName = null;

    beforeEach(() => {
        MyReact = require('../..');
        container = document.createElement('div');
        attachedListener = null;
        renderedName = null;

        Inner = class extends MyReact.Component {
            getName() {
                return this.props.name;
            }
            render() {
                attachedListener = this.props.onClick;
                renderedName = this.props.name;
                return <div className={this.props.name} />;
            }
        };
    });

    function test(element, expectedTag, expectedClassName) {
        const instance = MyReact.render(element, container);
        expect(container.firstChild).not.toBeNull();
        expect(container.firstChild.tagName).toBe(expectedTag);
        expect(container.firstChild.className).toBe(expectedClassName);
        return instance;
    }

    it('preserves the name of the class for use in error messages', () => {
        class Foo extends MyReact.Component { }
        expect(Foo.name).toBe('Foo');
    });

    it('throws if no render function is defined', () => {
        class Foo extends MyReact.Component { }
        expect(() => MyReact.render(<Foo />, container)).toThrow();
    });

    it('renders a simple stateless component with prop', () => {
        class Foo extends MyReact.Component {
            render() {
                return <Inner name={this.props.bar} />;
            }
        }
        test(<Foo bar="foo" />, 'DIV', 'foo');
        test(<Foo bar="bar" />, 'DIV', 'bar');
    });

    it('renders based on state using initial values in this.props', () => {
        class Foo extends MyReact.Component {
            constructor(props) {
                super(props);
                this.state = { bar: this.props.initialValue };
            }
            render() {
                return <span className={this.state.bar} />;
            }
        }
        test(<Foo initialValue="foo" />, 'SPAN', 'foo');
    });

})
