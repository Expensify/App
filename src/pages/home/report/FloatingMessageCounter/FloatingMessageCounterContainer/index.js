import React from 'react';
import {Animated} from 'react-native';
import styles from '../../../../../styles/styles';
import floatingMessageCounterContainerPropTypes from './floatingMessageCounterContainerPropTypes';

const FloatingMessageCounterContainer = props => (
    <Animated.View style={[styles.floatingMessageCounterWrapper, ...props.containerStyles]}>
        {props.children}
    </Animated.View>
);

FloatingMessageCounterContainer.propTypes = floatingMessageCounterContainerPropTypes;
FloatingMessageCounterContainer.displayName = 'FloatingMessageCounterContainer';

export default FloatingMessageCounterContainer;
