import React from 'react';
import {Animated, View} from 'react-native';
import useThemeStyles from '@styles/useThemeStyles';
import floatingMessageCounterContainerPropTypes from './floatingMessageCounterContainerPropTypes';

function FloatingMessageCounterContainer(props) {
    const styles = useThemeStyles();
    return (
        <Animated.View style={[styles.floatingMessageCounterWrapperAndroid, ...props.containerStyles]}>
            <View style={styles.floatingMessageCounterSubWrapperAndroid}>{props.children}</View>
        </Animated.View>
    );
}

FloatingMessageCounterContainer.propTypes = floatingMessageCounterContainerPropTypes;
FloatingMessageCounterContainer.displayName = 'FloatingMessageCounterContainer';

export default FloatingMessageCounterContainer;
