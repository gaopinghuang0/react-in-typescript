
let MyReact;  // These two things are referring to the same file.
let ReactDOM;
let ReactTestUtils;

// Credit: adopted from React/src/renderers/shared/**/__tests__/ReactComponent-test.js
describe('DOMRenderer', () => {
    beforeEach(() => {
        MyReact = require('../..');
        ReactDOM = MyReact;
        ReactTestUtils = require('../../utils/ReactTestUtils').default;
    });

    it('should throw on invalid render targets', () => {
        var container = document.createElement('div');
        // jQuery objects are basically arrays; people often pass them in by mistake
        expect(function () {
            ReactDOM.render(<div />, [container]);
        }).toThrowError(
            'render(...): Target container is not a DOM element.',
        );

        expect(function () {
            ReactDOM.render(<div />, null);
        }).toThrowError(
            'render(...): Target container is not a DOM element.',
        );
    });

    // TODO:
    // it('should warn when children are mutated during render', () => {
    //     jest.spyOn(console, 'error');
    //     function Wrapper(props) {
    //         props.children[1] = <p key={1} />; // Mutation is illegal
    //         return <div>{props.children}</div>;
    //     }
    //     expect(() => {
    //         ReactTestUtils.renderIntoDocument(
    //             <Wrapper>
    //                 <span key={0} />
    //                 <span key={1} />
    //                 <span key={2} />
    //             </Wrapper>,
    //         );
    //     }).toThrowError(/Cannot assign to read only property.*/);
    // });

    // TODO:
    // it('should call refs at the correct time', () => {
    //     var log = [];

    //     class Inner extends React.Component {
    //       render() {
    //         log.push(`inner ${this.props.id} render`);
    //         return <div />;
    //       }

    //       componentDidMount() {
    //         log.push(`inner ${this.props.id} componentDidMount`);
    //       }

    //       componentDidUpdate() {
    //         log.push(`inner ${this.props.id} componentDidUpdate`);
    //       }

    //       componentWillUnmount() {
    //         log.push(`inner ${this.props.id} componentWillUnmount`);
    //       }
    //     }

    //     class Outer extends React.Component {
    //       render() {
    //         return (
    //           <div>
    //             <Inner
    //               id={1}
    //               ref={c => {
    //                 log.push(`ref 1 got ${c ? `instance ${c.props.id}` : 'null'}`);
    //               }}
    //             />
    //             <Inner
    //               id={2}
    //               ref={c => {
    //                 log.push(`ref 2 got ${c ? `instance ${c.props.id}` : 'null'}`);
    //               }}
    //             />
    //           </div>
    //         );
    //       }

    //       componentDidMount() {
    //         log.push('outer componentDidMount');
    //       }

    //       componentDidUpdate() {
    //         log.push('outer componentDidUpdate');
    //       }

    //       componentWillUnmount() {
    //         log.push('outer componentWillUnmount');
    //       }
    //     }

    //     // mount, update, unmount
    //     var el = document.createElement('div');
    //     log.push('start mount');
    //     ReactDOM.render(<Outer />, el);
    //     log.push('start update');
    //     ReactDOM.render(<Outer />, el);
    //     log.push('start unmount');
    //     ReactDOM.unmountComponentAtNode(el);

    //     /* eslint-disable indent */
    //     expect(log).toEqual([
    //       'start mount',
    //       'inner 1 render',
    //       'inner 2 render',
    //       'inner 1 componentDidMount',
    //       'ref 1 got instance 1',
    //       'inner 2 componentDidMount',
    //       'ref 2 got instance 2',
    //       'outer componentDidMount',
    //       'start update',
    //       // Previous (equivalent) refs get cleared
    //       'ref 1 got null',
    //       'inner 1 render',
    //       'ref 2 got null',
    //       'inner 2 render',
    //       'inner 1 componentDidUpdate',
    //       'ref 1 got instance 1',
    //       'inner 2 componentDidUpdate',
    //       'ref 2 got instance 2',
    //       'outer componentDidUpdate',
    //       'start unmount',
    //       'outer componentWillUnmount',
    //       'ref 1 got null',
    //       'inner 1 componentWillUnmount',
    //       'ref 2 got null',
    //       'inner 2 componentWillUnmount',
    //     ]);
    //     /* eslint-enable indent */
    //   });

    it('fires the callback after a component is rendered', () => {
        var callback = jest.fn();
        var container = document.createElement('div');
        ReactDOM.render(<div />, container, callback);
        expect(callback.mock.calls.length).toBe(1);
        ReactDOM.render(<div className="foo" />, container, callback);
        expect(callback.mock.calls.length).toBe(2);
        ReactDOM.render(<span />, container, callback);
        expect(callback.mock.calls.length).toBe(3);
    });

});