// Native-stack owns transitions; this scrim only handles dimming and dismissal.
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import type {BaseOverlayProps} from './BaseOverlay';

function Overlay({onPress, positionLeftValue = -2 * variables.sideBarWidth, positionRightValue = 0}: BaseOverlayProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Animated.View
            aria-hidden
            style={[styles.pAbsolute, styles.t0, styles.b0, styles.overlayBackground, {left: positionLeftValue, right: positionRightValue, opacity: variables.overlayOpacity}]}
        >
            <PressableWithoutFeedback
                style={[styles.flex1, styles.boxShadowNone]}
                onPress={onPress}
                accessibilityLabel={translate('common.close')}
                role={CONST.ROLE.BUTTON}
                testID="rhp-overlay-dismiss"
                sentryLabel="RHPOverlay-Dismiss"
            />
        </Animated.View>
    );
}

export default Overlay;
