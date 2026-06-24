import React, {useEffect} from 'react';
import type {ViewStyle} from 'react-native';
import Animated, {ReduceMotion, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import onAnimationFinished from '@components/Overlay/libs/onAnimationFinished';
import type {ModalKind} from '@components/Overlay/libs/overlayStore';
import {usePresence} from '@components/Overlay/Presence';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import easing from './easing';

type BackdropProps = {
    kind: ModalKind;
    onPress?: () => void;
    animationInTiming: number;
    animationOutTiming: number;
};

const TARGET_OVERLAY_OPACITY = variables.overlayOpacity;

function isFullWidthNarrowSheet(kind: ModalKind, isSmallScreenWidth: boolean): boolean {
    return isSmallScreenWidth && (kind === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED || kind === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT);
}

function Backdrop({kind, onPress, animationInTiming, animationOutTiming}: BackdropProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {translate} = useLocalize();
    const presence = usePresence('<Modal.Backdrop>');
    const {state: presenceState} = presence.state;
    const {onAnimationEnd} = presence.actions;
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- full-width-narrow-sheet suppression keys on raw device width, not RHP narrow-mode.
    const {isSmallScreenWidth} = useResponsiveLayout();
    const targetOpacity = isFullWidthNarrowSheet(kind, isSmallScreenWidth) ? 0 : TARGET_OVERLAY_OPACITY;

    const opacity = useSharedValue<number>(0);

    useEffect(() => {
        if (presenceState === 'mounted') {
            opacity.set(withTiming(targetOpacity, {duration: animationInTiming, easing, reduceMotion: ReduceMotion.System}));
            return;
        }
        if (presenceState === 'unmountSuspended') {
            opacity.set(withTiming(0, {duration: animationOutTiming, easing, reduceMotion: ReduceMotion.System}, onAnimationFinished(onAnimationEnd)));
        }
    }, [presenceState, animationInTiming, animationOutTiming, opacity, targetOpacity, onAnimationEnd]);

    const animatedStyle = useAnimatedStyle((): ViewStyle => ({opacity: opacity.get()}));

    if (presenceState === 'unmounted') {
        return null;
    }

    if (!onPress) {
        return (
            <Animated.View
                aria-hidden
                importantForAccessibility="no-hide-descendants"
                pointerEvents="auto"
                style={[styles.modalBackdrop, {width: windowWidth, height: windowHeight, backgroundColor: theme.overlay}, animatedStyle]}
            />
        );
    }

    return (
        <PressableWithoutFeedback
            accessible
            accessibilityLabel={translate('modal.backdropLabel')}
            onPress={onPress}
            sentryLabel={CONST.SENTRY_LABEL.REANIMATED_MODAL.BACKDROP}
        >
            <Animated.View
                pointerEvents="auto"
                style={[styles.modalBackdrop, {width: windowWidth, height: windowHeight, backgroundColor: theme.overlay}, animatedStyle]}
            />
        </PressableWithoutFeedback>
    );
}

export default Backdrop;
