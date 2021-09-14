import React from 'react';
import {View, Animated} from 'react-native';
import styles from '../../../../../styles/styles';
import propTypes from './MarkerBadgeContainerPropTypes';

const MarkerBadgeContainer = props => (
    <Animated.View style={[styles.reportMarkerBadgeWrapperAndroid, ...props.containerStyles]}>
        <View style={styles.reportMarkerBadgeSubWrapperAndroid}>
            {props.children}
        </View>
    </Animated.View>
);

MarkerBadgeContainer.propTypes = propTypes;
MarkerBadgeContainer.displayName = 'MarkerBadgeContainer';

export default MarkerBadgeContainer;
