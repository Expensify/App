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
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';

export default function SecondaryOverlay() {
    const {shouldRenderSecondaryOverlayForRHPOnSuperWideRHP, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForWideRHP, superWideRHPRouteKeys, wideRHPRouteKeys} =
        useContext(WideRHPContext);

    const route = useRoute();

    const isWide = !!route?.key && wideRHPRouteKeys.includes(route.key);
    const isSuperWide = !!route?.key && superWideRHPRouteKeys.includes(route.key);

    const isRHPDisplayedOnWideRHP = shouldRenderSecondaryOverlayForRHPOnWideRHP && isWide;
    const isRHPDisplayedOnSuperWideRHP = shouldRenderSecondaryOverlayForRHPOnSuperWideRHP && isSuperWide;
    const isWideRHPDisplayedOnSuperWideRHP = shouldRenderSecondaryOverlayForWideRHP && isSuperWide;

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
