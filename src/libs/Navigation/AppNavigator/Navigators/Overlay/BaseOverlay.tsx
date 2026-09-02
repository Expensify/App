import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {OverlayStylesParams} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';

type BaseOverlayProps = {
    /* Callback to close the modal */
    onPress?: () => void;

    /* Override the progress from useCardAnimation. Necessary for the secondary overlay */
    progress?: OverlayStylesParams;

    /* Overlay position from the left edge of the container */
    positionLeftValue?: number | Animated.Value | Animated.AnimatedAddition<number>;

    /* Overlay position from the right edge of the container */
    positionRightValue?: number | Animated.Value | Animated.AnimatedAddition<number>;

    /* Use an appBG gradient fade anchored to the right edge instead of the dimming scrim (skinny RHP experiment) */
    gradientFade?: boolean;

    /* Width of the solid gradient region (the floating panel footprint). Defaults to the skinny RHP width. */
    gradientSolidWidth?: number;

    /* Color for the gradient fade. Defaults to theme.appBG. */
    gradientColor?: string;

    /* Render with no dimming background — invisible but still positioned and pressable to dismiss */
    transparent?: boolean;
};

/** Build a right-anchored appBG gradient: solid over the RHP footprint, then fading to transparent (same color, no gray edge). */
function getGradientBackgroundImage(appBG: string, solidWidth: number): string {
    const hex = appBG.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const fadeEnd = solidWidth + variables.rhpScrimFade;
    return `linear-gradient(to left, rgb(${r}, ${g}, ${b}) ${solidWidth}px, rgba(${r}, ${g}, ${b}, 0) ${fadeEnd}px)`;
}

// The default value of positionLeftValue is equal to -2 * variables.sideBarWidth, because we need to stretch the overlay to cover the sidebar and the translate animation distance.
function BaseOverlay({
    onPress,
    progress,
    positionLeftValue = -2 * variables.sideBarWidth,
    positionRightValue = 0,
    gradientFade = false,
    gradientSolidWidth = variables.rhpWidth + variables.rhpFloatingCardMargin,
    gradientColor,
    transparent = false,
}: BaseOverlayProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {current} = useCardAnimation();
    const {translate} = useLocalize();

    const activeProgress = progress ?? current.progress;
    const gradientStyle = [
        styles.pFixed,
        styles.t0,
        styles.b0,
        // Respect the overlay position so a stacked overlay ends at the covering panel's left edge and never
        // paints over it. The gradient's solid/fade is measured from this element's own right edge.
        {left: positionLeftValue, right: positionRightValue},
        styles.rhpGradientScrim(getGradientBackgroundImage(gradientColor ?? theme.appBG, gradientSolidWidth)),
        {opacity: activeProgress.interpolate({inputRange: [0, 0.5], outputRange: [0, variables.rhpGradientOpacity], extrapolate: 'clamp'})},
    ];
    const scrimStyle = [styles.pFixed, styles.t0, styles.b0, styles.overlayBackground, styles.overlayStyles({progress: activeProgress, positionLeftValue, positionRightValue})];
    // Transparent: keep positioning and pressability, drop the dimming background.
    const transparentStyle = [styles.pFixed, styles.t0, styles.b0, styles.overlayStyles({progress: activeProgress, positionLeftValue, positionRightValue})];

    // eslint-disable-next-line no-nested-ternary
    const overlayStyle = transparent ? transparentStyle : gradientFade ? gradientStyle : scrimStyle;

    return (
        <Animated.View
            id="BaseOverlay"
            aria-hidden
            style={overlayStyle}
        >
            <View style={[styles.flex1, styles.flexColumn]}>
                {/* In the latest Electron version buttons can't be both clickable and draggable.
             That's why we added this workaround. Because of two Pressable components on the desktop app
             we have 30px draggable ba at the top and the rest of the dimmed area is clickable. On other devices,
             everything behaves normally like one big pressable */}
                <PressableWithoutFeedback
                    style={[styles.draggableTopBar, styles.boxShadowNone, styles.cursorAuto]}
                    onPress={onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    id={CONST.OVERLAY.TOP_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
                <PressableWithoutFeedback
                    style={[styles.flex1, styles.boxShadowNone, styles.cursorAuto]}
                    onPress={onPress}
                    accessibilityLabel={translate('common.close')}
                    role={CONST.ROLE.BUTTON}
                    noDragArea
                    id={CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID}
                    tabIndex={-1}
                />
            </View>
        </Animated.View>
    );
}

export type {BaseOverlayProps};
export default BaseOverlay;
