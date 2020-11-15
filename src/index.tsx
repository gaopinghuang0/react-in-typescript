import { render } from './MyReact';
import { ReactHostElement } from './MyReact/types';

const element1: ReactHostElement = {
    type: 'a',
    props: {
        href: 'http://www.baidu.com',
        children: [{
            type: 'button',
            props: {
                className: 'btn',
                children: ['this is a button']
            },
        },
            'hyperscript']
    }
};
render(element1, document.getElementById('root'));


// createElement
// render
// 


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
