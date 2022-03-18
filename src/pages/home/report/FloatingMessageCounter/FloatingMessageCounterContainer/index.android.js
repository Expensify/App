import React from 'react';
import {View, Animated} from 'react-native';
import styles from '../../../../../styles/styles';
import floatingMessageCounterContainerPropTypes from './floatingMessageCounterContainerPropTypes';

const FloatingMessageCounterContainer = props => (
    <Animated.View style={[styles.reportMarkerBadgeWrapperAndroid, ...props.containerStyles]}>
        <View style={styles.reportMarkerBadgeSubWrapperAndroid}>
            {props.children}
        </View>
    </Animated.View>
);

FloatingMessageCounterContainer.propTypes = floatingMessageCounterContainerPropTypes;
FloatingMessageCounterContainer.displayName = 'FloatingMessageCounterContainer';

export default FloatingMessageCounterContainer;
