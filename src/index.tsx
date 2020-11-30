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

class Link extends MyReact.Component {
    componentWillMount() {
        console.log('Link will Mount');
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
            <a href="http://google.com">{children}</a>
        )
    }
}

var element1 = (
    <div className="container">
        <Button key="1" text="this is a button" />
        <Button text="this is another button" />
        {null}
        <Link>google</Link>
    </div>
)

// var textElement = 'hello';
// var domElement = (<a href="http://hello.com">hello</a>)
// var emptyElement = (undefined);

MyReact.render(element1, document.getElementById('root'));
// Render again should trigger unmount
MyReact.render(element1, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
