// Wide RHP scrims stay stationary while the panel follows the root stack's transition progress.
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';

import useModalCardStyleInterpolator, {getModalCardMotionStyle} from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import getRHPLayoutValue from '@libs/Navigation/helpers/getRHPLayoutValue';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import {useCardAnimation} from '@react-navigation/stack';
// The frame follows react-navigation's Animated offset while preserving the web floating-card margin.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

function useRootRHPCardStyleInterpolator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const interpolate = useModalCardStyleInterpolator();

    return (props: StackCardInterpolationProps) =>
        interpolate({
            props,
            enter: {kind: shouldUseNarrowLayout ? 'slide-from-width' : 'none'},
            // Wide hosts fill the window; their panel frame owns the Concierge offset instead.
            applySidePanelOffset: shouldUseNarrowLayout,
        });
}

function useRHPFrameStyle() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {sidePanelOffset} = useSidePanelState();
    const props = useCardAnimation();

    if (shouldUseNarrowLayout) {
        return undefined;
    }

    return {
        ...getModalCardMotionStyle(props, CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB, true),
        right: getRHPLayoutValue(0, Animated.add<number>(sidePanelOffset.current, variables.rhpFloatingCardMargin)),
    };
}

export {useRootRHPCardStyleInterpolator, useRHPFrameStyle};
