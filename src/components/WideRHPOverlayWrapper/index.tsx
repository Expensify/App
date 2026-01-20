import {useRoute} from '@react-navigation/native';
import React, {useContext} from 'react';
import {
    animatedReceiptPaneRHPWidth,
    modalStackOverlaySuperWideRHPPositionLeft,
    modalStackOverlayWideRHPPositionLeft,
    secondOverlayRHPOnSuperWideRHPProgress,
    secondOverlayRHPOnWideRHPProgress,
    secondOverlayWideRHPProgress,
    WideRHPContext,
} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';

function SecondaryOverlay() {
    const {shouldRenderSecondaryOverlayForRHPOnSuperWideRHP, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForWideRHP, superWideRHPRouteKeys, wideRHPRouteKeys} =
        useContext(WideRHPContext);

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
    if (isRHPDisplayedOnWideRHP) {
        return (
            <Overlay
                progress={secondOverlayRHPOnWideRHPProgress}
                // If RHP is displayed on Wide RHP which is displayed above the Super Wide RHP, the secondary overlay's position left should be calculated from the left edge of the super wide RHP.
                positionLeftValue={animatedReceiptPaneRHPWidth}
            />
        );
    }

    if (isWideRHPDisplayedOnSuperWideRHP) {
        return (
            <Overlay
                progress={secondOverlayWideRHPProgress}
                positionLeftValue={modalStackOverlayWideRHPPositionLeft}
            />
        );
    }

    if (isRHPDisplayedOnSuperWideRHP) {
        return (
            <Overlay
                progress={secondOverlayRHPOnSuperWideRHPProgress}
                positionLeftValue={modalStackOverlaySuperWideRHPPositionLeft}
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
