import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext} from 'react';
import {
    animatedReceiptPaneRHPWidth,
    modalStackOverlaySuperWideRHPPositionLeft,
    modalStackOverlayWideRHPPositionLeft,
    secondOverlayRHPOnSuperWideRHPProgress,
    secondOverlayRHPOnWideRHPProgress,
    secondOverlayWideRHPProgress,
    thirdOverlayProgress,
    WideRHPContext,
} from '@components/WideRHPContextProvider';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';

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

function TertiaryOverlay() {
    const {shouldRenderTertiaryOverlay, wideRHPRouteKeys} = useContext(WideRHPContext);
    const route = useRoute();

    const isWide = route?.key && wideRHPRouteKeys.includes(route.key);

    // This overlay is used to cover the space under the narrower RHP screen when more than one RHP width is displayed on the screen
    // There is a special case where three different RHP widths are displayed at the same time. In this case, an overlay under RHP should be rendered from Wide RHP.
    if (isWide && shouldRenderTertiaryOverlay) {
        return (
            <Overlay
                progress={thirdOverlayProgress}
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
    const {syncRHPKeys} = useContext(WideRHPContext);

    // This hook handles the case when a wider RHP is displayed above a narrower one.
    // In this situation, we need to synchronize the keys, as superWideRHPKeys and wideRHPKeys store the keys of the screens that are visible.
    useFocusEffect(
        useCallback(
            () => () => {
                if (!shouldWrap) {
                    return;
                }

                // Synchronization after RHP unmount is handled in RightModalNavigator.tsx.
                const isRHPOpened = navigationRef?.getRootState()?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
                if (!isRHPOpened) {
                    return;
                }

                syncRHPKeys();
            },
            [shouldWrap, syncRHPKeys],
        ),
    );

    if (!shouldWrap) {
        return children;
    }

    return (
        <>
            {children}
            <SecondaryOverlay />
            <TertiaryOverlay />
        </>
    );
}
