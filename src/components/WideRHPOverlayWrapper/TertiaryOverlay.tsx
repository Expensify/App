import {useRoute} from '@react-navigation/native';
import React, {useContext} from 'react';
import {modalStackOverlaySuperWideRHPPositionLeft, thirdOverlayProgress, WideRHPContext} from '@components/WideRHPContextProvider';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';

export default function TertiaryOverlay() {
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
