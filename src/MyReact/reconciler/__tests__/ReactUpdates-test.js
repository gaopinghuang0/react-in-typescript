
import * as MyReact from '../..';
import ReactTestUtils from '../../utils/ReactTestUtils';
import ReactUpdates from '../ReactUpdates';

const ReactDOM = MyReact;

// Credit: adopted from React/src/renderers/shared/**/__tests__/ReactUpdates-test.js
describe('ReactUpdates', () => {
    beforeEach(() => {
    });


    it('should batch state when updating state twice', () => {
        var updateCount = 0;

        class Component extends MyReact.Component {
            state = { x: 0 };

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div>{this.state.x}</div>;
            }
        }

        var instance = ReactTestUtils.renderIntoDocument(<Component />);
        expect(instance.state.x).toBe(0);

        ReactUpdates.batchedUpdates(function () {
            instance.setState({ x: 1 });
            instance.setState({ x: 2 });
            expect(instance.state.x).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(instance.state.x).toBe(2);
        expect(updateCount).toBe(1);
    });

    it('should batch state when updating two different state keys', () => {
        var updateCount = 0;

        class Component extends MyReact.Component {
            state = { x: 0, y: 0 };

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div>({this.state.x}, {this.state.y})</div>;
            }
        }

        var instance = ReactTestUtils.renderIntoDocument(<Component />);
        expect(instance.state.x).toBe(0);
        expect(instance.state.y).toBe(0);

        ReactUpdates.batchedUpdates(function () {
            instance.setState({ x: 1 });
            instance.setState({ y: 2 });
            expect(instance.state.x).toBe(0);
            expect(instance.state.y).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(instance.state.x).toBe(1);
        expect(instance.state.y).toBe(2);
        expect(updateCount).toBe(1);
    });

    it('should batch state and props together', () => {
        var updateCount = 0;

        class Component extends MyReact.Component {
            state = { y: 0 };

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div>({this.props.x}, {this.state.y})</div>;
            }
        }

        var container = document.createElement('div');
        var instance = ReactDOM.render(<Component x={0} />, container);
        expect(instance.props.x).toBe(0);
        expect(instance.state.y).toBe(0);

        ReactUpdates.batchedUpdates(function () {
            ReactDOM.render(<Component x={1} />, container);
            instance.setState({ y: 2 });
            expect(instance.props.x).toBe(0);
            expect(instance.state.y).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(instance.props.x).toBe(1);
        expect(instance.state.y).toBe(2);
        expect(updateCount).toBe(1);
    });

    // Skip now because `refs` is not supported yet.
    // Due to the same reason, skip all other tests in this file that involve refs.
    // it('should batch parent/child state updates together', () => {
    //     var parentUpdateCount = 0;

    //     class Parent extends MyReact.Component {
    //         state = { x: 0 };

    //         componentDidUpdate() {
    //             parentUpdateCount++;
    //         }

    //         render() {
    //             return <div><Child ref="child" x={this.state.x} /></div>;
    //         }
    //     }

    //     var childUpdateCount = 0;

    //     class Child extends MyReact.Component {
    //         state = { y: 0 };

    //         componentDidUpdate() {
    //             childUpdateCount++;
    //         }

    //         render() {
    //             return <div>{this.props.x + this.state.y}</div>;
    //         }
    //     }

    //     var instance = ReactTestUtils.renderIntoDocument(<Parent />);
    //     var child = instance.refs.child;
    //     expect(instance.state.x).toBe(0);
    //     expect(child.state.y).toBe(0);

    //     ReactUpdates.batchedUpdates(function () {
    //         instance.setState({ x: 1 });
    //         child.setState({ y: 2 });
    //         expect(instance.state.x).toBe(0);
    //         expect(child.state.y).toBe(0);
    //         expect(parentUpdateCount).toBe(0);
    //         expect(childUpdateCount).toBe(0);
    //     });

    //     expect(instance.state.x).toBe(1);
    //     expect(child.state.y).toBe(2);
    //     expect(parentUpdateCount).toBe(1);
    //     expect(childUpdateCount).toBe(1);
    // });


    it('should support chained state updates', () => {
        var updateCount = 0;

        class Component extends MyReact.Component {
            state = { x: 0 };

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div>{this.state.x}</div>;
            }
        }

        var instance = ReactTestUtils.renderIntoDocument(<Component />);
        expect(instance.state.x).toBe(0);

        var innerCallbackRun = false;
        ReactUpdates.batchedUpdates(function () {
            instance.setState({ x: 1 }, function () {
                instance.setState({ x: 2 }, function () {
                    expect(this).toBe(instance);
                    innerCallbackRun = true;
                    expect(instance.state.x).toBe(2);
                    expect(updateCount).toBe(2);
                });
                expect(instance.state.x).toBe(1);
                expect(updateCount).toBe(1);
            });
            expect(instance.state.x).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(innerCallbackRun).toBeTruthy();
        expect(instance.state.x).toBe(2);
        expect(updateCount).toBe(2);
    });

    it('should batch forceUpdate together', () => {
        var shouldUpdateCount = 0;
        var updateCount = 0;

        class Component extends MyReact.Component {
            state = { x: 0 };

            shouldComponentUpdate() {
                shouldUpdateCount++;
            }

            componentDidUpdate() {
                updateCount++;
            }

            render() {
                return <div>{this.state.x}</div>;
            }
        }

        var instance = ReactTestUtils.renderIntoDocument(<Component />);
        expect(instance.state.x).toBe(0);

        var callbacksRun = 0;
        ReactUpdates.batchedUpdates(function () {
            instance.setState({ x: 1 }, function () {
                callbacksRun++;
            });
            instance.forceUpdate(function () {
                callbacksRun++;
            });
            expect(instance.state.x).toBe(0);
            expect(updateCount).toBe(0);
        });

        expect(callbacksRun).toBe(2);
        // shouldComponentUpdate shouldn't be called since we're forcing
        expect(shouldUpdateCount).toBe(0);
        expect(instance.state.x).toBe(1);
        expect(updateCount).toBe(1);
    });

    it('should queue mount-ready handlers across different roots', () => {
        // We'll define two components A and B, then update both of them. When A's
        // componentDidUpdate handlers is called, B's DOM should already have been
        // updated.

        var a;
        var b;

        var aUpdated = false;

        class A extends MyReact.Component {
            state = { x: 0 };

            componentDidUpdate() {
                expect(ReactDOM.findDOMNode(b).textContent).toBe('B1');
                aUpdated = true;
            }

            render() {
                return <div>A{this.state.x}</div>;
            }
        }

        class B extends MyReact.Component {
            state = { x: 0 };

            render() {
                return <div>B{this.state.x}</div>;
            }
        }

        a = ReactTestUtils.renderIntoDocument(<A />);
        b = ReactTestUtils.renderIntoDocument(<B />);

        ReactUpdates.batchedUpdates(function () {
            a.setState({ x: 1 });
            b.setState({ x: 1 });
        });

        expect(aUpdated).toBe(true);
    });

    it('should flush updates in the correct order across roots', () => {
        var instances = [];
        var updates = [];

        class MockComponent extends MyReact.Component {
            render() {
                updates.push(this.props.depth);
                return <div />;
            }

            componentDidMount() {
                instances.push(this);
                if (this.props.depth < this.props.count) {
                    ReactDOM.render(
                        <MockComponent
                            depth={this.props.depth + 1}
                            count={this.props.count}
                        />,
                        ReactDOM.findDOMNode(this),
                    );
                }
            }
        }

        ReactTestUtils.renderIntoDocument(<MockComponent depth={0} count={2} />);

        expect(updates).toEqual([0, 1, 2]);

        ReactUpdates.batchedUpdates(function () {
            // Simulate update on each component from top to bottom.
            instances.forEach(function (instance) {
                instance.forceUpdate();
            });
        });

        expect(updates).toEqual([0, 1, 2, 0, 1, 2]);
    });

    it('should queue nested updates', () => {
        // See https://github.com/facebook/react/issues/1147

        class X extends MyReact.Component {
            state = { s: 0 };

            render() {
                if (this.state.s === 0) {
                    return (
                        <div>
                            <span>0</span>
                        </div>
                    );
                } else {
                    return <div>1</div>;
                }
            }

            go = () => {
                this.setState({ s: 1 });
                this.setState({ s: 0 });
                this.setState({ s: 1 });
            };
        }

        class Y extends MyReact.Component {
            render() {
                return (
                    <div>
                        <Z />
                    </div>
                );
            }
        }

        class Z extends MyReact.Component {
            render() {
                return <div />;
            }

            componentWillUpdate() {
                x.go();
            }
        }

        var x;
        var y;

        x = ReactTestUtils.renderIntoDocument(<X />);
        y = ReactTestUtils.renderIntoDocument(<Y />);
        expect(ReactDOM.findDOMNode(x).textContent).toBe('0');

        y.forceUpdate();
        expect(ReactDOM.findDOMNode(x).textContent).toBe('1');
    });

    it('should queue updates from during mount', () => {
        // See https://github.com/facebook/react/issues/1353
        var a;

        class A extends MyReact.Component {
            state = { x: 0 };

            componentWillMount() {
                a = this;
            }

            render() {
                return <div>A{this.state.x}</div>;
            }
        }

        class B extends MyReact.Component {
            componentWillMount() {
                a.setState({ x: 1 });
            }

            render() {
                return <div />;
            }
        }

        ReactUpdates.batchedUpdates(function () {
            ReactTestUtils.renderIntoDocument(
                <div>
                    <A />
                    <B />
                </div>,
            );
        });

        expect(a.state.x).toBe(1);
        expect(ReactDOM.findDOMNode(a).textContent).toBe('A1');
    });

    it('calls componentWillReceiveProps setState callback properly', () => {
        var callbackCount = 0;

        class A extends MyReact.Component {
            state = { x: this.props.x };

            componentWillReceiveProps(nextProps) {
                var newX = nextProps.x;
                this.setState({ x: newX }, function () {
                    // State should have updated by the time this callback gets called
                    expect(this.state.x).toBe(newX);
                    callbackCount++;
                });
            }

            render() {
                return <div>{this.state.x}</div>;
            }
        }

        var container = document.createElement('div');
        ReactDOM.render(<A x={1} />, container);
        ReactDOM.render(<A x={2} />, container);
        expect(callbackCount).toBe(1);
    });

    it('does not call render after a component as been deleted', () => {
        var renderCount = 0;
        var componentB = null;

        class B extends MyReact.Component {
            state = { updates: 0 };

            componentDidMount() {
                componentB = this;
            }

            render() {
                renderCount++;
                return <div />;
            }
        }

        class A extends MyReact.Component {
            state = { showB: true };

            render() {
                return this.state.showB ? <B /> : <div />;
            }
        }

        var component = ReactTestUtils.renderIntoDocument(<A />);

        ReactUpdates.batchedUpdates(function () {
            // B will have scheduled an update but the batching should ensure that its
            // update never fires.
            componentB.setState({ updates: 1 });
            component.setState({ showB: false });
        });

        expect(renderCount).toBe(1);
    });

    it('throws in setState if the update callback is not a function', () => {
        function Foo() {
            this.a = 1;
            this.b = 2;
        }

        class A extends MyReact.Component {
            state = {};

            render() {
                return <div />;
            }
        }

        var component = ReactTestUtils.renderIntoDocument(<A />);

        expect(() => component.setState({}, 'no')).toThrowError(
            'setState(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: string.',
        );
        expect(() => component.setState({}, {})).toThrowError(
            'setState(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: Object.',
        );
        expect(() => component.setState({}, new Foo())).toThrowError(
            'setState(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: Foo (keys: a, b).',
        );
    });

})