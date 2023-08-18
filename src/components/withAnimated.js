import React from 'react';
import {Animated} from 'react-native';

// eslint-disable-next-line react/prefer-stateless-function
class WithAnimated extends React.Component {
    render() {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <WrappedComponent {...this.props} />;
    }
}

function withAnimated(WrappedComponent) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    WithAnimated.displayName = `WithAnimated(${displayName})`;

    return Animated.createAnimatedComponent(WithAnimated);
}

export default withAnimated;
