// Import to slience the JSX warnings.
import * as React from 'react';

import * as MyReact from './MyReact';
import Component from './MyReact/Component';

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

class Link extends Component {
    render() {
        const { children } = this.props;
        console.log(children);
        return (
            <a href="http://google.com">{children}</a>
        )
    }
}

var element1 = (
    <div className="container">
        <Button key="1" text="this is a button" />
        <Button text="this is another button" />
        <Link>google</Link>
    </div>
)


MyReact.render(element1, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
