import * as MyReact from '../..';
import ReactTestUtils from '../../utils/ReactTestUtils';

const ReactDOM = MyReact;

describe('findDOMNode', () => {
    it('findDOMNode should return null if passed null', () => {
        expect(ReactDOM.findDOMNode(null)).toBe(null);
    });

    it('findDOMNode should find dom element', () => {
        class MyNode extends MyReact.Component {
            render() {
                return <div><span>Noise</span></div>;
            }
        }

        var myNode = ReactTestUtils.renderIntoDocument(<MyNode />);
        var myDiv = ReactDOM.findDOMNode(myNode);
        var mySameDiv = ReactDOM.findDOMNode(myDiv);
        expect(myDiv.tagName).toBe('DIV');
        expect(mySameDiv).toBe(myDiv);
    });

    it('findDOMNode should reject random objects', () => {
        expect(function () {
            ReactDOM.findDOMNode({ foo: 'bar' });
        }).toThrowError(
            'Element appears to be neither ReactComponent nor DOMNode (keys: foo)',
        );
    });

    it('findDOMNode should reject unmounted objects with render func', () => {
        class Foo extends MyReact.Component {
            render() {
                return <div />;
            }
        }

        var container = document.createElement('div');
        var inst = ReactDOM.render(<Foo />, container);
        ReactDOM.unmount(container);

        expect(() => ReactDOM.findDOMNode(inst)).toThrowError(
            'findDOMNode was called on an unmounted component.',
        );
    });

    it('findDOMNode should not throw an error when called within a component that is not mounted', () => {
        class Bar extends MyReact.Component {
            componentWillMount() {
                expect(ReactDOM.findDOMNode(this)).toBeNull();
            }

            render() {
                return <div />;
            }
        }

        expect(() => ReactTestUtils.renderIntoDocument(<Bar />)).not.toThrow();
    });
})