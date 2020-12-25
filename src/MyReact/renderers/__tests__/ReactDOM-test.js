import * as MyReact from '../..';
import ReactTestUtils from '../../utils/ReactTestUtils';

const ReactDOM = MyReact;


describe('ReactDOM', () => {

    it('allows a DOM element to be used with a string', () => {
        var element = MyReact.createElement('div', { className: 'foo' });
        var instance = ReactTestUtils.renderIntoDocument(element);
        expect(ReactDOM.findDOMNode(instance).tagName).toBe('DIV');
    });

    /**
     * We need to make sure that updates occur to the actual node that's in the
     * DOM, instead of a stale cache.
     */
    it('should purge the DOM cache when removing nodes', () => {
        var myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dog" />,
                <div key="theBird" className="bird" />
            </div>,
        );
        // Warm the cache with theDog
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dogbeforedelete" />,
                <div key="theBird" className="bird" />,
             </div>,
        );
        // Remove theDog - this should purge the cache
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theBird" className="bird" />,
            </div>,
        );
        // Now, put theDog back. It's now a different DOM node.
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dog" />,
                <div key="theBird" className="bird" />,
            </div>,
        );
        // Change the className of theDog. It will use the same element
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="bigdog" />,
                <div key="theBird" className="bird" />,
            </div>,
        );
        var root = ReactDOM.findDOMNode(myDiv);
        var dog = root.childNodes[0];
        expect(dog.className).toBe('bigdog');
    });


    it('throws in render() if the mount callback is not a function', () => {
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

        var myDiv = document.createElement('div');
        expect(() => ReactDOM.render(<A />, myDiv, 'no')).toThrowError(
            'ReactDOM.render(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: string.',
        );
        expect(() => ReactDOM.render(<A />, myDiv, {})).toThrowError(
            'ReactDOM.render(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: Object.',
        );
        expect(() => ReactDOM.render(<A />, myDiv, new Foo())).toThrowError(
            'ReactDOM.render(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: Foo (keys: a, b).',
        );
    });

    it('throws in render() if the update callback is not a function', () => {
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

        var myDiv = document.createElement('div');
        ReactDOM.render(<A />, myDiv);

        expect(() => ReactDOM.render(<A />, myDiv, 'no')).toThrowError(
            'ReactDOM.render(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: string.',
        );
        expect(() => ReactDOM.render(<A />, myDiv, {})).toThrowError(
            'ReactDOM.render(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: Object.',
        );
        expect(() => ReactDOM.render(<A />, myDiv, new Foo())).toThrowError(
            'ReactDOM.render(...): Expected the last optional `callback` argument ' +
            'to be a function. Instead received: Foo (keys: a, b).',
        );
    });
})