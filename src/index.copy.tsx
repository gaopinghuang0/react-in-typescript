// Import to slience the JSX warnings.
import * as React from 'react';

import * as MyReact from './MyReact';

function Button(props: any): React.ReactElement {
    return {
        type: 'button',
        key: '1',
        props: {
            class: 'btn',
            children: [props.text]
        }
    }
}

// Option1:
// type LinkState = {
//     count: number
// }
// class Link extends MyReact.Component<{}, LinkState> {
class Link extends MyReact.Component {
    // Option 2:
    state: { count: number };  // This is necessary for Component to infer type of state

    constructor(props: any) {
        super(props);
        this.state = { count: 0 };
    }

    componentWillMount() {
        console.log('Link will Mount');
    }

    componentDidMount() {
        console.log('Link did Mount');

        // setTimeout(() => {
        //     this.setState({ count: this.state.count + 1 });
        // }, 1000);
    }

    componentWillUnmount() {
        console.log('Link will Unmount');
    }

    componentWillUpdate() {
        console.log('Link will update')
    }

    componentDidUpdate() {
        console.log('Link Did update')
    }

    render() {
        const { children } = this.props;
        return (
            <a href="http://google.com">{children} {this.state.count}</a>
        )
    }
}

const element1 = (
    <div className="container">
        <Button key="1" text="this is a button" />
        <Button text="this is another button" />
        {null}
        <Link>google</Link>
    </div>
)

// const textElement = 'hello';
// const domElement = (<a href="http://hello.com">hello</a>)
// const emptyElement = (undefined);

// const element2 = (<Link>Google</Link>);
// const element3 = (<Link>Facebook</Link>);

const element4 = (
    <div className="container2">
        <Button key="1" text="this is a button" />
        <Button text="this is a different button" />
        {null}
        <Link>baidu</Link>
    </div>
)

let renderCount = 0;
class Foo extends MyReact.Component<{ text: string }> {

    componentDidMount() {
        console.log("componentDidMount")
    }
    componentWillUnmount() {
        console.log("componentWillUnmount")
    }
    render() {
        return <span>{this.props.text}</span>;
    }
}

MyReact.render(<Foo text="orange" key="A" />, document.getElementById('root'));
console.log("====")
MyReact.render(<Foo text="green" key="B" />, document.getElementById('root'));
console.log("====")
MyReact.render(<Foo text="blue" key="B" />, document.getElementById('root'));

// Should reuse existing DOM
// setTimeout(() => {
//     MyReact.render(element4, document.getElementById('root'));
// }, 1000)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
