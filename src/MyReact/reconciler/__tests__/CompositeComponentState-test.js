
import * as MyReact from '../..';

const ReactDOM = MyReact;
let TestComponent;

// Credit: adopted from React/src/renderers/shared/**/__tests__/ReactCompositeComponentState-test.js
describe('DOMRenderer', () => {
    beforeEach(() => {

        TestComponent = class extends MyReact.Component {
            constructor(props) {
                super(props);
                this.peekAtState('getInitialState', undefined, props);
                this.state = { color: 'red' };
            }

            peekAtState = (from, state = this.state, props = this.props) => {
                props.stateListener(from, state && state.color);
            };

            peekAtCallback = from => {
                return () => this.peekAtState(from);
            };

            setFavoriteColor(nextColor) {
                this.setState(
                    { color: nextColor },
                    this.peekAtCallback('setFavoriteColor'),
                );
            }

            render() {
                this.peekAtState('render');
                return <div>{this.state.color}</div>;
            }

            componentWillMount() {
                this.peekAtState('componentWillMount-start');
                this.setState(function (state) {
                    this.peekAtState('before-setState-sunrise', state);
                });
                this.setState(
                    { color: 'sunrise' },
                    this.peekAtCallback('setState-sunrise'),
                );
                this.setState(function (state) {
                    this.peekAtState('after-setState-sunrise', state);
                });
                this.peekAtState('componentWillMount-after-sunrise');
                this.setState(
                    { color: 'orange' },
                    this.peekAtCallback('setState-orange'),
                );
                this.setState(function (state) {
                    this.peekAtState('after-setState-orange', state);
                });
                this.peekAtState('componentWillMount-end');
            }

            componentDidMount() {
                this.peekAtState('componentDidMount-start');
                this.setState(
                    { color: 'yellow' },
                    this.peekAtCallback('setState-yellow'),
                );
                this.peekAtState('componentDidMount-end');
            }

            componentWillReceiveProps(newProps) {
                this.peekAtState('componentWillReceiveProps-start');
                if (newProps.nextColor) {
                    this.setState(function (state) {
                        this.peekAtState('before-setState-receiveProps', state);
                        return { color: newProps.nextColor };
                    });
                    this.updater.enqueueReplaceState(this, { color: undefined });
                    this.setState(function (state) {
                        this.peekAtState('before-setState-again-receiveProps', state);
                        return { color: newProps.nextColor };
                    }, this.peekAtCallback('setState-receiveProps'));
                    this.setState(function (state) {
                        this.peekAtState('after-setState-receiveProps', state);
                    });
                }
                this.peekAtState('componentWillReceiveProps-end');
            }

            shouldComponentUpdate(nextProps, nextState) {
                this.peekAtState('shouldComponentUpdate-currentState');
                this.peekAtState('shouldComponentUpdate-nextState', nextState);
                return true;
            }

            componentWillUpdate(nextProps, nextState) {
                this.peekAtState('componentWillUpdate-currentState');
                this.peekAtState('componentWillUpdate-nextState', nextState);
            }

            componentDidUpdate(prevProps, prevState) {
                this.peekAtState('componentDidUpdate-currentState');
                this.peekAtState('componentDidUpdate-prevState', prevState);
            }

            componentWillUnmount() {
                this.peekAtState('componentWillUnmount');
            }
        };
    });

    it('should support setting state', () => {
        var container = document.createElement('div');
        document.body.appendChild(container);

        var stateListener = jest.fn();
        var instance = ReactDOM.render(
            <TestComponent stateListener={stateListener} />,
            container,
            function peekAtInitialCallback() {
                this.peekAtState('initial-callback');
            },
        );
        ReactDOM.render(
            <TestComponent stateListener={stateListener} nextColor="green" />,
            container,
            instance.peekAtCallback('setProps'),
        );
        instance.setFavoriteColor('blue');
        instance.forceUpdate(instance.peekAtCallback('forceUpdate'));

        ReactDOM.unmount(container);

        expect(stateListener.mock.calls.join('\n')).toEqual(
            [
                // there is no state when getInitialState() is called
                ['getInitialState', null],
                ['componentWillMount-start', 'red'],
                // setState()'s only enqueue pending states.
                ['componentWillMount-after-sunrise', 'red'],
                ['componentWillMount-end', 'red'],
                // pending state queue is processed
                ['before-setState-sunrise', 'red'],
                ['after-setState-sunrise', 'sunrise'],
                ['after-setState-orange', 'orange'],
                // pending state has been applied
                ['render', 'orange'],
                ['componentDidMount-start', 'orange'],
                // setState-sunrise and setState-orange should be called here,
                // after the bug in #1740
                // componentDidMount() called setState({color:'yellow'}), which is async.
                // The update doesn't happen until the next flush.
                ['componentDidMount-end', 'orange'],
                ['shouldComponentUpdate-currentState', 'orange'],
                ['shouldComponentUpdate-nextState', 'yellow'],
                ['componentWillUpdate-currentState', 'orange'],
                ['componentWillUpdate-nextState', 'yellow'],
                ['render', 'yellow'],
                ['componentDidUpdate-currentState', 'yellow'],
                ['componentDidUpdate-prevState', 'orange'],
                ['setState-sunrise', 'yellow'],
                ['setState-orange', 'yellow'],
                ['setState-yellow', 'yellow'],
                ['initial-callback', 'yellow'],
                ['componentWillReceiveProps-start', 'yellow'],
                // setState({color:'green'}) only enqueues a pending state.
                ['componentWillReceiveProps-end', 'yellow'],
                // pending state queue is processed
                // before-setState-receiveProps never called, due to replaceState.
                ['before-setState-again-receiveProps', undefined],
                ['after-setState-receiveProps', 'green'],
                ['shouldComponentUpdate-currentState', 'yellow'],
                ['shouldComponentUpdate-nextState', 'green'],
                ['componentWillUpdate-currentState', 'yellow'],
                ['componentWillUpdate-nextState', 'green'],
                ['render', 'green'],
                ['componentDidUpdate-currentState', 'green'],
                ['componentDidUpdate-prevState', 'yellow'],
                ['setState-receiveProps', 'green'],
                ['setProps', 'green'],
                // setFavoriteColor('blue')
                ['shouldComponentUpdate-currentState', 'green'],
                ['shouldComponentUpdate-nextState', 'blue'],
                ['componentWillUpdate-currentState', 'green'],
                ['componentWillUpdate-nextState', 'blue'],
                ['render', 'blue'],
                ['componentDidUpdate-currentState', 'blue'],
                ['componentDidUpdate-prevState', 'green'],
                ['setFavoriteColor', 'blue'],
                // forceUpdate()
                ['componentWillUpdate-currentState', 'blue'],
                ['componentWillUpdate-nextState', 'blue'],
                ['render', 'blue'],
                ['componentDidUpdate-currentState', 'blue'],
                ['componentDidUpdate-prevState', 'blue'],
                ['forceUpdate', 'blue'],
                // unmountComponent()
                // state is available within `componentWillUnmount()`
                ['componentWillUnmount', 'blue'],
            ].join('\n'),
        );
    });

    it('should batch unmounts', () => {
        var outer;

        class Inner extends MyReact.Component {
            render() {
                return <div />;
            }

            componentWillUnmount() {
                // This should get silently ignored (maybe with a warning), but it
                // shouldn't break React.
                outer.setState({ showInner: false });
            }
        }

        class Outer extends MyReact.Component {
            state = { showInner: true };

            render() {
                return <div>{this.state.showInner && <Inner />}</div>;
            }
        }

        var container = document.createElement('div');
        outer = ReactDOM.render(<Outer />, container);
        expect(() => {
            ReactDOM.unmount(container);
        }).not.toThrow();
    });
});
