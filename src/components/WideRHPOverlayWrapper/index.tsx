import {useRoute} from '@react-navigation/native';
import React from 'react';
import {modalStackOverlayWideRHPPositionLeft, secondOverlayWideRHPProgress, useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';

function SecondaryOverlay() {
    const {shouldRenderSecondaryOverlayForWideRHP, superWideRHPRouteKeys} = useWideRHPState();

    const route = useRoute();

    const isSuperWide = !!route?.key && superWideRHPRouteKeys.includes(route.key);

    const isWideRHPDisplayedOnSuperWideRHP = shouldRenderSecondaryOverlayForWideRHP && isSuperWide;

    /**
     * This overlay is used to cover the space under the narrower RHP screen when more than one RHP width is displayed on the screen.
     * Its position is calculated as follows:
     * The width of the window for which we calculate the overlay positions is the width of the RHP window, for example for Super Wide RHP it will be 1260 px on a wide layout.
     * We need to move the overlay left from the left edge of the RHP below to the left edge of the RHP above.
     * To calculate this, subtract the width of the widest RHP from the width of the RHP above.
     * Please note that in this case, the overlay is rendered from the RHP screen displayed below (the Wide RHP).
     *
     * The "single RHP displayed on (super) wide RHP" cases are not handled here: those small RHPs are centered modals with their
     * own dim (see ModalStackNavigators index). Only "Wide RHP displayed on Super Wide RHP" remains.
     *  */
    if (isWideRHPDisplayedOnSuperWideRHP) {
        return (
            <Overlay
                progress={secondOverlayWideRHPProgress}
                positionLeftValue={modalStackOverlayWideRHPPositionLeft}
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
