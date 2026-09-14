import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import type {OverlayStylesParams} from '@styles/index';
import type {Color} from '@styles/theme/types';
import variables from '@styles/variables';

import CONST from '@src/CONST';

import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';

type BaseOverlayProps = {
    /** Callback to close the modal */
    onPress?: () => void;

    /** Override the progress from useCardAnimation. Necessary for the secondary overlay */
    progress?: OverlayStylesParams;

    /** Overlay position from the left edge of the container */
    positionLeftValue?: number | Animated.Value | Animated.AnimatedAddition<number>;

    /** Overlay position from the right edge of the container */
    positionRightValue?: number | Animated.Value | Animated.AnimatedAddition<number>;

    /** Scrim background color override. Defaults to `theme.overlay`; the floating RHP passes the lighter `theme.rhpOverlay`. */
    overlayColor?: Color;

    /** Max opacity the scrim ramps up to. Defaults to `variables.overlayOpacity`; the floating RHP passes the lighter `rhpOverlayOpacity`. */
    maxOpacity?: number;

    /** Overlay position from the top edge of the container. The floating RHP overlays pass the card's inset so the scrim doesn't bleed past it. */
    positionTopValue?: number;

    /** Overlay position from the bottom edge of the container. The floating RHP overlays pass the card's inset so the scrim doesn't bleed past it. */
    positionBottomValue?: number;
};

// The default value of positionLeftValue is equal to -2 * variables.sideBarWidth, because we need to stretch the overlay to cover the sidebar and the translate animation distance.
function BaseOverlay({
    onPress,
    progress,
    positionLeftValue = -2 * variables.sideBarWidth,
    positionRightValue = 0,
    overlayColor,
    maxOpacity,
    positionTopValue,
    positionBottomValue,
}: BaseOverlayProps) {
    const styles = useThemeStyles();
    const {current} = useCardAnimation();
    const {translate} = useLocalize();

    return (
        <Animated.View
            id="BaseOverlay"
            aria-hidden
            style={[
                styles.pFixed,
                overlayColor ? {backgroundColor: overlayColor} : styles.overlayBackground,
                styles.overlayStyles({progress: progress ?? current.progress, positionLeftValue, positionRightValue, positionTopValue, positionBottomValue, maxOpacity}),
            ]}
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
