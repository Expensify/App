// Web keeps its existing card transition; native separates the host from the moving panel.
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';

import CONST from '@src/CONST';

import type {StackCardInterpolationProps} from '@react-navigation/stack';
// eslint-disable-next-line no-restricted-imports
import type {Animated, StyleProp, ViewStyle} from 'react-native';

function useRootRHPCardStyleInterpolator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const interpolate = useModalCardStyleInterpolator();

    return (props: StackCardInterpolationProps) =>
        interpolate({
            props,
            enter: shouldUseNarrowLayout ? {kind: 'slide-from-width'} : {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB},
            applySidePanelOffset: true,
        });
}

function useRHPFrameStyle(): Animated.WithAnimatedValue<StyleProp<ViewStyle>> {
    return undefined;
}

export {useRootRHPCardStyleInterpolator, useRHPFrameStyle};
