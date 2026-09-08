import {useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';

import CONST from '@src/CONST';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import {CardStyleInterpolators} from '@react-navigation/stack';
import {useMemo} from 'react';

import RHP_WEB_TRANSITION_SPEC from './RHPTransitionSpec';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

// This function is necessary for proper animation if a wide format RHP screen is visible.
// In such case for every narrow screen on top of the wide screen we use only half width.
// The other half is transparent. To account for that we will divide screen width to make sure the animations starts in the right spot.
const getModifiedCardStyleInterpolatorProps = (props: StackCardInterpolationProps): StackCardInterpolationProps => {
    return {
        ...props,
        layouts: {
            screen: {
                ...props.layouts.screen,
                width: props.layouts.screen.width / 2,
            },
        },
    };
};

const useRHPScreenOptions = (): PlatformStackNavigationOptions => {
    const styles = useThemeStyles();
    const customInterpolator = useModalCardStyleInterpolator();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    // We have to use the isSmallScreenWidth instead of shouldUseNarrow layout, because we want to have information about screen width without the context of side modal.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Adjust props on wide layout and when the wide RHP is visible
    const shouldAdjustInterpolatorProps = !isSmallScreenWidth && wideRHPRouteKeys.length;

    // A wide or super-wide RHP is a centered card. Any RHP pushed while one is in context is a skinny card stacked on
    // top of it (the initial centered card mounts as index 0 and never runs this entering animation). Give that push
    // the same subtle slide-and-fade as the centered cards instead of a full-width slide from the screen edge.
    const isWideRHPContext = !isSmallScreenWidth && (wideRHPRouteKeys.length > 0 || superWideRHPRouteKeys.length > 0);

    return useMemo<PlatformStackNavigationOptions>(() => {
        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            gestureDirection: 'horizontal',
            web: {
                // Stacked over a centered card: subtle slide-and-fade. Otherwise the .forHorizontalIOS interpolator from
                // `@react-navigation` is misbehaving on Safari, so we override it with the Expensify custom interpolator.
                // eslint-disable-next-line no-nested-ternary
                cardStyleInterpolator: isWideRHPContext
                    ? (props) => customInterpolator({props, enter: {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}})
                    : isSafari()
                      ? (props) => customInterpolator({props, enter: {kind: 'slide-from-width'}})
                      : (props) => CardStyleInterpolators.forHorizontalIOS(shouldAdjustInterpolatorProps ? getModifiedCardStyleInterpolatorProps(props) : props),
                presentation: Presentation.TRANSPARENT_MODAL,
                cardOverlayEnabled: false,
                cardStyle: styles.navigationScreenCardStyle,
                gestureDirection: 'horizontal',
                transitionSpec: isSmallScreenWidth ? undefined : RHP_WEB_TRANSITION_SPEC,
            },
        };
    }, [customInterpolator, shouldAdjustInterpolatorProps, isWideRHPContext, isSmallScreenWidth, styles.navigationScreenCardStyle]);
};

export default useRHPScreenOptions;
