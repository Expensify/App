import React from 'react';
import {Animated} from 'react-native';

export function withAnimated(WrappedComponent) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    class WithAnimated extends React.Component {
        static displayName = `WithAnimated(${displayName})`;

        render() {
            return <WrappedComponent {...this.props} />;
        }
    }

    return Animated.createAnimatedComponent(WithAnimated);
}
