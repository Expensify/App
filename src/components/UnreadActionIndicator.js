import React from 'react';
import {Animated, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';

const propTypes = {
    // Animated opacity
    // eslint-disable-next-line react/forbid-prop-types
    animatedOpacity: PropTypes.object.isRequired,
};

const UnreadActionIndicator = props => (
    <Animated.View style={[
        styles.unreadIndicatorContainer,
        {opacity: props.animatedOpacity},
    ]}
    >
        <View style={styles.unreadIndicatorLine} />
        <Text style={styles.unreadIndicatorText}>
            NEW
        </Text>
    </Animated.View>
);

UnreadActionIndicator.propTypes = propTypes;
UnreadActionIndicator.displayName = 'UnreadActionIndicator';

export default UnreadActionIndicator;
