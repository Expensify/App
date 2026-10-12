import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useThemeStyles from '@hooks/useThemeStyles';

import type {OverlayPositionValue, OverlayStylesParams} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import {useIsFocused} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

// Navigation supplies React Native Animated values, not Reanimated shared values.
const AnimatedDismissal = Animated.createAnimatedComponent(PressableWithoutFeedback);

type BaseOverlayProps = {
    /** Callback to close the modal */
    onPress?: () => void;

    /** Override the progress from useCardAnimation. Necessary for the secondary overlay */
    progress?: OverlayStylesParams;

    /** Overlay position from the left edge of the container */
    positionLeftValue?: OverlayPositionValue;

    /** Overlay position from the right edge of the container */
    positionRightValue?: OverlayPositionValue;

    /** Pointer dismissal stops at this right inset, independently of the visual scrim. */
    dismissalPositionRight?: OverlayPositionValue;

    /** Peak opacity the overlay fades to, defaults to variables.overlayOpacity */
    maxOpacity?: number;

    /** Overlay position from the top edge of the container, in px */
    positionTopValue?: number;

    /** Overlay position from the bottom edge of the container, in px */
    positionBottomValue?: number;

    /** Stays positioned and pressable, just paints nothing. */
    transparent?: boolean;
};

// Visual dimming and pointer dismissal are separate. Screen readers dismiss through the active panel's controls.
function BaseOverlay({
    onPress,
    progress,
    positionLeftValue = 0,
    positionRightValue = 0,
    dismissalPositionRight,
    positionTopValue = 0,
    positionBottomValue = 0,
    maxOpacity = variables.overlayOpacity,
    transparent = false,
}: BaseOverlayProps) {
    const styles = useThemeStyles();
    const {current} = useCardAnimation();
    const isFocused = useIsFocused();
    const left = typeof positionLeftValue === 'number' ? Math.max(0, positionLeftValue) : positionLeftValue;

    return (
        <>
            <Animated.View
                id="BaseOverlay"
                testID="rhp-overlay"
                pointerEvents="none"
                aria-hidden
                accessible={false}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[
                    styles.pAbsolute,
                    !transparent && styles.overlayBackground,
                    styles.overlayStyles({
                        progress: progress ?? current.progress,
                        positionLeftValue: left,
                        positionRightValue,
                        positionTopValue,
                        positionBottomValue,
                        maxOpacity,
                    }),
                ]}
            />
            {!!onPress && isFocused && (
                <AnimatedDismissal
                    testID="rhp-overlay-dismiss"
                    id={CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID}
                    onPress={onPress}
                    aria-hidden
                    accessible={false}
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    shouldUseAutoHitSlop={false}
                    tabIndex={-1}
                    style={[
                        styles.pAbsolute,
                        styles.boxShadowNone,
                        styles.cursorAuto,
                        {left, right: dismissalPositionRight ?? positionRightValue, top: positionTopValue, bottom: positionBottomValue},
                    ]}
                    sentryLabel="RHPOverlay-Dismiss"
                />
            )}
        </>
    );
}

export type {BaseOverlayProps};
export default BaseOverlay;
