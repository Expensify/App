import React from 'react';
import {StyleSheet, Animated} from 'react-native';
import {useCardAnimation} from '@react-navigation/stack';

import PropTypes from 'prop-types';
import variables from '../../../../styles/variables';
import themeColors from '../../../../styles/themes/default';
import styles from '../../../../styles/styles';

import PressableWithoutFeedback from '../../../../components/Pressable/PressableWithoutFeedback';
import useLocalize from '../../../../hooks/useLocalize';
import CONST from '../../../../CONST';

const propTypes = {
    /* Callback to close the modal */
    onPress: PropTypes.func.isRequired,
};

function Overlay(props) {
    const {current} = useCardAnimation();
    const {translate} = useLocalize();

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
            <PressableWithoutFeedback
                style={[styles.flex1]}
                onPress={props.onPress}
                accessibilityLabel={translate('common.close')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            />
        </Animated.View>
    );
}

Overlay.propTypes = propTypes;
Overlay.displayName = 'Overlay';

export default Overlay;
