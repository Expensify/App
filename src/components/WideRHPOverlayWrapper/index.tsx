import {secondOverlayRHPOnSuperWideRHPProgress, secondOverlayRHPOnWideRHPProgress, secondOverlayWideRHPProgress, useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import RHPOverlay from '@libs/Navigation/AppNavigator/Navigators/Overlay/RHPOverlay';
import Navigation from '@libs/Navigation/Navigation';

import {useRoute} from '@react-navigation/native';
import React from 'react';

function SecondaryOverlay() {
    const {shouldRenderSecondaryOverlayForRHPOnSuperWideRHP, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForWideRHP, superWideRHPRouteKeys, wideRHPRouteKeys} =
        useWideRHPState();

    const route = useRoute();

    const isWide = !!route?.key && wideRHPRouteKeys.includes(route.key);
    const isSuperWide = !!route?.key && superWideRHPRouteKeys.includes(route.key);

    const isRHPDisplayedOnWideRHP = shouldRenderSecondaryOverlayForRHPOnWideRHP && isWide;
    const isRHPDisplayedOnSuperWideRHP = shouldRenderSecondaryOverlayForRHPOnSuperWideRHP && isSuperWide;
    const isWideRHPDisplayedOnSuperWideRHP = shouldRenderSecondaryOverlayForWideRHP && isSuperWide;

    // Rendered by the screen below, so the dim clips to its rounded corners and a press dismisses to it.
    if (isRHPDisplayedOnWideRHP) {
        return (
            <RHPOverlay
                progress={secondOverlayRHPOnWideRHPProgress}
                positionLeftValue={0}
                onPress={Navigation.dismissToPreviousRHP}
            />
        );
    }

    if (isWideRHPDisplayedOnSuperWideRHP) {
        return (
            <RHPOverlay
                progress={secondOverlayWideRHPProgress}
                positionLeftValue={0}
                onPress={() => Navigation.closeRHPFlow()}
            />
        );
    }

    if (isRHPDisplayedOnSuperWideRHP) {
        return (
            <RHPOverlay
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
