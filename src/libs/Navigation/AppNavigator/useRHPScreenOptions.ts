import {useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';

import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';

import RHP_WEB_TRANSITION_SPEC from './RHPTransitionSpec';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

const useRHPScreenOptions = (): PlatformStackNavigationOptions => {
    const styles = useThemeStyles();
    const customInterpolator = useModalCardStyleInterpolator();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    // We have to use the isSmallScreenWidth instead of shouldUseNarrow layout, because we want to have information about screen width without the context of side modal.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // A wide or super-wide RHP (an expense or expense report) is visible, so any RHP pushed on top of it is a centered
    // modal. Fade it in place instead of sliding it in from the right.
    const shouldFadeOverWideRHP = !isSmallScreenWidth && (wideRHPRouteKeys.length > 0 || superWideRHPRouteKeys.length > 0);

    return useMemo<PlatformStackNavigationOptions>(() => {
        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            gestureDirection: 'horizontal',
            web: {
                // Fade in when centered over a wide/super-wide RHP. Otherwise slide in from the right (the .forHorizontalIOS
                // interpolator from `@react-navigation` misbehaves on Safari, so we override it with our custom one there).
                // eslint-disable-next-line no-nested-ternary
                cardStyleInterpolator: shouldFadeOverWideRHP
                    ? (props) => customInterpolator({props, enter: {kind: 'fade'}})
                    : isSafari()
                      ? (props) => customInterpolator({props, enter: {kind: 'slide-from-width'}})
                      : (props) => CardStyleInterpolators.forHorizontalIOS(props),
                presentation: Presentation.TRANSPARENT_MODAL,
                cardOverlayEnabled: false,
                cardStyle: styles.navigationScreenCardStyle,
                gestureDirection: 'horizontal',
                transitionSpec: isSmallScreenWidth ? undefined : RHP_WEB_TRANSITION_SPEC,
            },
        };
    }, [customInterpolator, shouldFadeOverWideRHP, isSmallScreenWidth, styles.navigationScreenCardStyle]);
};

export default useRHPScreenOptions;
