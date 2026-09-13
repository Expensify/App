// Keep native scrims stationary while the panel follows the root stack's transition progress.
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';

import CONST from '@src/CONST';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import {useCardAnimation} from '@react-navigation/stack';

function useRootRHPCardStyleInterpolator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const interpolate = useModalCardStyleInterpolator();

    return (props: StackCardInterpolationProps) => interpolate({props, enter: {kind: shouldUseNarrowLayout ? 'slide-from-width' : 'none'}, applySidePanelOffset: true});
}

function useRHPFrameStyle() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const props = useCardAnimation();
    const interpolate = useModalCardStyleInterpolator();

    if (shouldUseNarrowLayout) {
        return undefined;
    }

    return interpolate({props, enter: {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}}).cardStyle;
}

export {useRootRHPCardStyleInterpolator, useRHPFrameStyle};
