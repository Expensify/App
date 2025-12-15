import {useRoute} from '@react-navigation/native';
import React, {useContext} from 'react';
import {modalStackOverlaySuperWideRHPPositionLeft, thirdOverlayProgress, WideRHPContext} from '@components/WideRHPContextProvider';
import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';

export default function TertiaryOverlay() {
    const {shouldRenderTertiaryOverlay, wideRHPRouteKeys} = useContext(WideRHPContext);
    const route = useRoute();

    const isWide = route?.key && wideRHPRouteKeys.includes(route.key);

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
