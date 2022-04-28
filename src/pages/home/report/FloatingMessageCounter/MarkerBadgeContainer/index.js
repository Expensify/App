import React from 'react';
import {Animated} from 'react-native';
import styles from '../../../../../styles/styles';
import propTypes from './markerBadgeContainerPropTypes';

const MarkerBadgeContainer = props => (
    <Animated.View style={[styles.reportMarkerBadgeWrapper, ...props.containerStyles]}>
        {props.children}
    </Animated.View>
);

MarkerBadgeContainer.propTypes = propTypes;
MarkerBadgeContainer.displayName = 'MarkerBadgeContainer';

export default MarkerBadgeContainer;
