import React from 'react';
import {Animated, View} from 'react-native';
import {useCardAnimation} from '@react-navigation/stack';

import PropTypes from 'prop-types';
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

    return (
        <Animated.View style={styles.overlayStyles(current)}>
            <View style={[styles.flex1, styles.flexColumn]}>
                {/* In the latest Electron version buttons can't be both clickable and draggable. 
                    That's why we added this workaround. Because of two Pressable components on the desktop app 
                    we have 30px draggable ba at the top and the rest of the dimmed area is clickable. On other devices,
                    everything behaves normally like one big pressable */}
                <PressableWithoutFeedback
                    style={[styles.draggableTopBar]}
                    onPress={props.onPress}
                    accessibilityLabel={translate('common.close')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                />
                <PressableWithoutFeedback
                    style={[styles.flex1]}
                    onPress={props.onPress}
                    accessibilityLabel={translate('common.close')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                    noDragArea
                />
            </View>
        </Animated.View>
    );
}

Overlay.propTypes = propTypes;
Overlay.displayName = 'Overlay';

export default Overlay;
