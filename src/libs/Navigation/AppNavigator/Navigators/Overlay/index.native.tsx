// Visual dimming and pointer dismissal are separate. Screen readers dismiss through the active panel's controls.
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useThemeStyles from '@hooks/useThemeStyles';

import {useIsFocused} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import type {BaseOverlayProps} from './BaseOverlay';

function Overlay({onPress, progress, positionLeftValue = 0, positionRightValue = 0, dismissalPositionRight}: BaseOverlayProps) {
    const styles = useThemeStyles();
    const {current} = useCardAnimation();
    const isFocused = useIsFocused();
    // Native has no off-window card gutter to cover. Do not export off-window hit bounds.
    const left = typeof positionLeftValue === 'number' ? Math.max(0, positionLeftValue) : positionLeftValue;

    return (
        <>
            <Animated.View
                testID="rhp-overlay"
                pointerEvents="none"
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[
                    styles.pAbsolute,
                    styles.t0,
                    styles.b0,
                    styles.overlayBackground,
                    styles.overlayStyles({progress: progress ?? current.progress, positionLeftValue: left, positionRightValue}),
                ]}
            />
            {!!onPress && isFocused && (
                <PressableWithoutFeedback
                    style={[styles.pAbsolute, styles.t0, styles.b0, styles.boxShadowNone, {left, right: dismissalPositionRight ?? positionRightValue}]}
                    onPress={onPress}
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    shouldUseAutoHitSlop={false}
                    testID="rhp-overlay-dismiss"
                    sentryLabel="RHPOverlay-Dismiss"
                />
            )}
        </>
    );
}

export default Overlay;
