import React from 'react';
import {Animated} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import floatingMessageCounterContainerPropTypes from './floatingMessageCounterContainerPropTypes';

function FloatingMessageCounterContainer(props) {
    const styles = useThemeStyles();
    return (
        <Animated.View
            accessibilityHint={props.accessibilityHint}
            style={[styles.floatingMessageCounterWrapper, ...props.containerStyles]}
        >
            {props.children}
        </Animated.View>
    );
}

FloatingMessageCounterContainer.propTypes = floatingMessageCounterContainerPropTypes;
FloatingMessageCounterContainer.displayName = 'FloatingMessageCounterContainer';

export default FloatingMessageCounterContainer;
