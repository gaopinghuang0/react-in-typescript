// Import to slience the JSX warnings.
import * as React from 'react';

import * as MyReact from './MyReact';
import ReactUpdates from './MyReact/reconciler/ReactUpdates';

class A extends MyReact.Component {
    state = { x: 0 };

    componentDidUpdate() {
        const node = MyReact.findDOMNode(b);
        if (node) {
            console.log((node as any).textContent);
        }
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

const a = MyReact.render(<A />, document.getElementById('root'));
const b = MyReact.render(<B />, document.getElementById('root'));

ReactUpdates.batchedUpdates(function () {
    a.setState({ x: 1 })
    b.setState({ x: 1 })
})