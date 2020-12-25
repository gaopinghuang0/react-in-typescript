
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

})