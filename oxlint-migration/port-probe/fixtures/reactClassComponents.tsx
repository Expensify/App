// Fixture for the eslint-plugin-react class-component rules. Two classes, because
// prefer-stateless-function only fires on a class that has nothing but render, and the other
// rules all need state or methods.
import React from 'react';

// prefer-stateless-function: nothing here needs a class
class OnlyRender extends React.Component {
    render() {
        return null;
    }
}

class Stateful extends React.Component {
    // static-property-placement ['property assignment']: expected as `Stateful.defaultProps = ...`
    static defaultProps = {};

    state = {counter: 1, neverRead: 2}; // no-unused-state: nothing ever reads neverRead

    // no-arrow-function-lifecycle: a lifecycle method must be a method, not a class property
    componentDidMount = () => {
        this.bump();
    };

    // sort-comp: render is supposed to come last
    render() {
        return null;
    }

    bump() {
        // no-access-state-in-setstate: read this.state inside setState instead of the updater form
        this.setState({counter: this.state.counter + 1});
    }

    unreachableHelper() {} // no-unused-class-component-methods
}

export {OnlyRender, Stateful};
