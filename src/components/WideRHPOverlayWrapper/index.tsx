import {secondOverlayRHPOnSuperWideRHPProgress, secondOverlayRHPOnWideRHPProgress, secondOverlayWideRHPProgress, useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';

import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import Navigation from '@libs/Navigation/Navigation';

import {useRoute} from '@react-navigation/native';
import React from 'react';

function SecondaryOverlay() {
    const theme = useTheme();
    const {shouldRenderSecondaryOverlayForRHPOnSuperWideRHP, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForWideRHP, superWideRHPRouteKeys, wideRHPRouteKeys} =
        useWideRHPState();

    const route = useRoute();

    const isWide = !!route?.key && wideRHPRouteKeys.includes(route.key);
    const isSuperWide = !!route?.key && superWideRHPRouteKeys.includes(route.key);

    const isRHPDisplayedOnWideRHP = shouldRenderSecondaryOverlayForRHPOnWideRHP && isWide;
    const isRHPDisplayedOnSuperWideRHP = shouldRenderSecondaryOverlayForRHPOnSuperWideRHP && isSuperWide;
    const isWideRHPDisplayedOnSuperWideRHP = shouldRenderSecondaryOverlayForWideRHP && isSuperWide;

    /**
     * These overlays are used to cover the space under the narrower RHP screen when more than one RHP width is displayed on the screen
     * Their position is calculated as follows:
     * The width of the window for which we calculate the overlay positions is the width of the RHP window, for example for Super Wide RHP it will be 1260 px on a wide layout.
     * We need to move the overlay left from the left edge of the RHP below to the left edge of the RHP above.
     * To calculate this, subtract the width of the widest RHP from the width of the RHP above.
     * Please note that in these cases, the overlay is rendered from the RHP screen displayed below. For example, if we display RHP on Wide RHP, the secondary overlay is rendered from Wide RHP, etc.
     * Three cases were described for the secondary overlay:
     * 1. Single RHP is displayed on Wide RHP
     * 2. Single RHP is displayed on Super Wide RHP
     * 3. Wide RHP is displayed on Super Wide RHP route.
     *  */
    // These overlays render behind the centered card (from the RHP screen below it), so clicking the dimmed area
    // dismisses to that screen while the centered card above stays fully interactive.
    if (isRHPDisplayedOnWideRHP) {
        return (
            <Overlay
                progress={secondOverlayRHPOnWideRHPProgress}
                positionLeftValue={0}
                onPress={Navigation.dismissToPreviousRHP}
                // A slight gradient fade — solid over the skinny, fading over the expense. Uses product200 (highlightBG)
                // rather than appBG so it reads against the expense card behind it.
                gradientFade
                gradientColor={theme.highlightBG}
            />
        );
    }

    if (isWideRHPDisplayedOnSuperWideRHP) {
        return (
            <Overlay
                progress={secondOverlayWideRHPProgress}
                positionLeftValue={0}
                onPress={() => Navigation.closeRHPFlow()}
            />
        );
    }

    if (isRHPDisplayedOnSuperWideRHP) {
        return (
            <Overlay
                progress={secondOverlayRHPOnSuperWideRHPProgress}
                positionLeftValue={0}
                onPress={Navigation.dismissToSuperWideRHP}
            />
        );
    }

    return null;
}

type WideRHPOverlayWrapperProps = {
    children: React.ReactNode;
    shouldWrap?: boolean;
};

// This overlay is used to cover the space under the narrower RHP screen when more than one RHP width is displayed on the screen.
export default function WideRHPOverlayWrapper({children, shouldWrap = true}: WideRHPOverlayWrapperProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const shouldUseOverlayWrapper = !isSmallScreenWidth && shouldWrap;

    if (!shouldUseOverlayWrapper) {
        return children;
    }

    return (
        <>
            {children}
            <SecondaryOverlay />
        </>
    );
}
