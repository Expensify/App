import React from 'react';
import {Animated} from 'react-native';

export default function withAnimated(WrappedComponent) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    
    // eslint-disable-next-line react/prefer-stateless-function
    class WithAnimated extends React.Component {
        static displayName = `WithAnimated(${displayName})`;

        render() {
            // eslint-disable-next-line react/jsx-props-no-spreading
            return <WrappedComponent {...this.props} />;
        }
    }

    return Animated.createAnimatedComponent(WithAnimated);
}