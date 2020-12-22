
let MyReact;

// Credit: adopted from React/src/isomorphic/**/__tests__/ReactES6Class-test.js
describe('ReactES6Class', () => {
    let Inner;
    let container;
    let attachedListener = null;
    let renderedName = null;
    const freeze = function (expectation) {
        Object.freeze(expectation);
        return expectation;
    };

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

    it('renders based on state using props in the constructor', () => {
        class Foo extends MyReact.Component {
            constructor(props) {
                super(props);
                this.state = { bar: props.initialValue };
            }
            changeState() {
                this.setState({ bar: 'bar' });
            }
            render() {
                if (this.state.bar === 'foo') {
                    return <div className="foo" />;
                }
                return <span className={this.state.bar} />;
            }
        }
        const instance = test(<Foo initialValue="foo" />, 'DIV', 'foo');
        instance.changeState();
        test(<Foo />, 'SPAN', 'bar');
    });

    // TODO: test `getDerivedStateFromProps`

    it('renders only once when setting state in componentWillMount', () => {
        let renderCount = 0;
        class Foo extends MyReact.Component {
            constructor(props) {
                super(props);
                this.state = { bar: props.initialValue };
            }
            componentWillMount() {
                this.setState({ bar: 'bar' });
            }
            render() {
                renderCount++;
                return <span className={this.state.bar} />;
            }
        }
        test(<Foo initialValue="foo" />, 'SPAN', 'bar');
        expect(renderCount).toBe(1);
    });

    it('should throw with non-object in the initial state property', () => {
        [['an array'], 'a string', 1234].forEach(function (state) {
            class Foo extends MyReact.Component {
                constructor() {
                    super();
                    this.state = state;
                }
                render() {
                    return <span />;
                }
            }
            expect(() => test(<Foo />, 'SPAN', '')).toThrowError(
                'Foo.state: must be set to an object or null',
            );
        });
    });

    it('should render with null in the initial state property', () => {
        class Foo extends MyReact.Component {
            constructor() {
                super();
                this.state = null;
            }
            render() {
                return <span />;
            }
        }
        test(<Foo />, 'SPAN', '');
    });

    it('will call all the normal life cycle methods', () => {
        let lifeCycles = [];
        class Foo extends MyReact.Component {
            constructor() {
                super();
                this.state = {};
            }
            componentWillMount() {
                lifeCycles.push('will-mount');
            }
            componentDidMount() {
                lifeCycles.push('did-mount');
            }
            componentWillReceiveProps(nextProps) {
                lifeCycles.push('receive-props', nextProps);
            }
            shouldComponentUpdate(nextProps, nextState) {
                lifeCycles.push('should-update', nextProps, nextState);
                return true;
            }
            componentWillUpdate(nextProps, nextState) {
                lifeCycles.push('will-update', nextProps, nextState);
            }
            componentDidUpdate(prevProps, prevState) {
                lifeCycles.push('did-update', prevProps, prevState);
            }
            componentWillUnmount() {
                lifeCycles.push('will-unmount');
            }
            render() {
                return <span className={this.props.value} />;
            }
        }
        test(<Foo value="foo" />, 'SPAN', 'foo');
        expect(lifeCycles).toEqual(['will-mount', 'did-mount']);
        lifeCycles = []; // reset
        test(<Foo value="bar" />, 'SPAN', 'bar');
        // prettier-ignore
        expect(lifeCycles).toEqual([
            'receive-props', freeze({ value: 'bar' }),
            'should-update', freeze({ value: 'bar' }), {},
            'will-update', freeze({ value: 'bar' }), {},
            'did-update', freeze({ value: 'foo' }), {},
        ]);
        lifeCycles = []; // reset
        MyReact.unmount(container);
        expect(lifeCycles).toEqual(['will-unmount']);
    });



})
