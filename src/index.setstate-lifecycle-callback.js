// Import to slience the JSX warnings.
import * as React from 'react';

import * as MyReact from './MyReact';
const ReactDOM = MyReact;

class TestComponent extends MyReact.Component {
    constructor(props) {
        super(props);
        this.peekAtState('getInitialState', undefined, props);
        this.state = { color: 'red' };
    }

    peekAtState = (from, state = this.state, props = this.props) => {
        props.stateListener(from, state && state.color);
    };

    peekAtCallback = from => {
        return () => this.peekAtState(from);
    };

    setFavoriteColor(nextColor) {
        this.setState(
            { color: nextColor },
            this.peekAtCallback('setFavoriteColor'),
        );
    }

    render() {
        this.peekAtState('render');
        return <div>{this.state.color}</div>;
    }

    componentWillMount() {
        this.peekAtState('componentWillMount-start');
        this.setState(function (state) {
            this.peekAtState('before-setState-sunrise', state);
        });
        this.setState(
            { color: 'sunrise' },
            this.peekAtCallback('setState-sunrise'),
        );
        this.setState(function (state) {
            this.peekAtState('after-setState-sunrise', state);
        });
        this.peekAtState('componentWillMount-after-sunrise');
        this.setState(
            { color: 'orange' },
            this.peekAtCallback('setState-orange'),
        );
        this.setState(function (state) {
            this.peekAtState('after-setState-orange', state);
        });
        this.peekAtState('componentWillMount-end');
    }

    componentDidMount() {
        this.peekAtState('componentDidMount-start');
        this.setState(
            { color: 'yellow' },
            this.peekAtCallback('setState-yellow'),
        );
        this.peekAtState('componentDidMount-end');
    }

    componentWillReceiveProps(newProps) {
        this.peekAtState('componentWillReceiveProps-start');
        if (newProps.nextColor) {
            this.setState(function (state) {
                this.peekAtState('before-setState-receiveProps', state);
                return { color: newProps.nextColor };
            });
            this.updater.enqueueReplaceState(this, { color: undefined });
            this.setState(function (state) {
                this.peekAtState('before-setState-again-receiveProps', state);
                return { color: newProps.nextColor };
            }, this.peekAtCallback('setState-receiveProps'));
            this.setState(function (state) {
                this.peekAtState('after-setState-receiveProps', state);
            });
        }
        this.peekAtState('componentWillReceiveProps-end');
    }

    shouldComponentUpdate(nextProps, nextState) {
        this.peekAtState('shouldComponentUpdate-currentState');
        this.peekAtState('shouldComponentUpdate-nextState', nextState);
        return true;
    }

    componentWillUpdate(nextProps, nextState) {
        this.peekAtState('componentWillUpdate-currentState');
        this.peekAtState('componentWillUpdate-nextState', nextState);
    }

    componentDidUpdate(prevProps, prevState) {
        this.peekAtState('componentDidUpdate-currentState');
        this.peekAtState('componentDidUpdate-prevState', prevState);
    }

    componentWillUnmount() {
        this.peekAtState('componentWillUnmount');
    }
};

var container = document.createElement('div');
document.body.appendChild(container);

var stateListener = () => { };
var instance = ReactDOM.render(
    <TestComponent stateListener={stateListener} />,
    container,
    function peekAtInitialCallback() {
        this.peekAtState('initial-callback');
    },
);
ReactDOM.render(
    <TestComponent stateListener={stateListener} nextColor="green" />,
    container,
    instance.peekAtCallback('setProps'),
);
instance.setFavoriteColor('blue');
instance.forceUpdate(instance.peekAtCallback('forceUpdate'));

ReactDOM.unmount(container);