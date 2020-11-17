// Import to slience the JSX warnings.
import * as React from 'react';

import * as MyReact from './MyReact';
// import { ReactElement, ReactHostElement } from './MyReact/types';

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

var element1 = (
    <a href="http://www.baidu.com">
        <Button text="this is a button" />
        <Button text="this is another button" />
        <Button text="this is third button" />
      hyperscript
    </a>
)
MyReact.render(element1, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
