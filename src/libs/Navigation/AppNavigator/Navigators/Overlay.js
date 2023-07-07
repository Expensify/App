import React from 'react';
import {Pressable, StyleSheet, Animated} from 'react-native';
import {useCardAnimation} from '@react-navigation/stack';

import PropTypes from 'prop-types';
import variables from '../../../../styles/variables';
import themeColors from '../../../../styles/themes/default';
import styles from '../../../../styles/styles';

const propTypes = {
    /* Callback to close the modal */
    onPress: PropTypes.func.isRequired,
};

function Overlay(props) {
    const {current} = useCardAnimation();

    const overlayStyles = {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: themeColors.overlay,
        opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, variables.overlayOpacity],
            extrapolate: 'clamp',
        }),
    };
    return (
        <Animated.View style={overlayStyles}>
            <Pressable
                onPress={props.onPress}
                style={styles.flex1}
            />
        </Animated.View>
    );
}

Overlay.propTypes= propTypes;
Overlay.displayName = 'Overlay';

export default Overlay;
