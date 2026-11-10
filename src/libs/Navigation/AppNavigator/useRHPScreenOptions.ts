import {useWideRHPState} from '@components/WideRHPContextProvider';

import useIsResizableSingleRHP from '@hooks/useIsResizableSingleRHP';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleRHPWidth from '@hooks/useSingleRHPWidth';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';

import CONST from '@src/CONST';

import type {StackCardInterpolationProps, StackCardStyleInterpolator} from '@react-navigation/stack';

import {CardStyleInterpolators} from '@react-navigation/stack';

import enhanceCardStyleInterpolator from './enhanceCardStyleInterpolator';
import RHP_WEB_TRANSITION_SPEC from './RHPTransitionSpec';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

const withScreenWidth = (props: StackCardInterpolationProps, width: number): StackCardInterpolationProps => ({
    ...props,
    layouts: {screen: {...props.layouts.screen, width}},
});

const useRHPScreenOptions = (): PlatformStackNavigationOptions => {
    const styles = useThemeStyles();
    const customInterpolator = useModalCardStyleInterpolator();
    const {wideRHPRouteKeys, superWideRHPRouteKeys} = useWideRHPState();

    // We have to use the isSmallScreenWidth instead of shouldUseNarrow layout, because we want to have information about screen width without the context of side modal.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Adjust props on wide layout and when the wide RHP is visible
    const shouldAdjustInterpolatorProps = !isSmallScreenWidth && wideRHPRouteKeys.length;

    // A skinny RHP pushed over a centered wide card gets the same slide-and-fade as the centered cards instead of a full-width slide.
    const isWideRHPContext = !isSmallScreenWidth && (wideRHPRouteKeys.length > 0 || superWideRHPRouteKeys.length > 0);

    const isResizableSingleRHP = useIsResizableSingleRHP();
    const {width: singleRHPWidth} = useSingleRHPWidth();

    const getHorizontalIOSInterpolatorProps = (props: StackCardInterpolationProps) => {
        // The resizable single RHP's stack measures a fixed-width box, so the slide distance comes from the dragged width instead.
        if (isResizableSingleRHP) {
            return withScreenWidth(props, singleRHPWidth);
        }
        // A narrow screen on top of a wide RHP uses only half the width, the other half being transparent, so it slides from there.
        return shouldAdjustInterpolatorProps ? withScreenWidth(props, props.layouts.screen.width / 2) : props;
    };

    // Otherwise forHorizontalIOS misbehaves on Safari, so the custom interpolator replaces it there.
    // eslint-disable-next-line no-nested-ternary
    const cardStyleInterpolator: StackCardStyleInterpolator = isWideRHPContext
        ? (props) => customInterpolator({props, enter: {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}})
        : isSafari()
          ? (props) => customInterpolator({props, enter: {kind: 'slide-from-width'}})
          : (props) => CardStyleInterpolators.forHorizontalIOS(getHorizontalIOSInterpolatorProps(props));

    return {
        headerShown: false,
        animation: Animations.SLIDE_FROM_RIGHT,
        gestureDirection: 'horizontal',
        web: {
            cardStyleInterpolator: isResizableSingleRHP ? enhanceCardStyleInterpolator(cardStyleInterpolator, {cardStyle: styles.singleRHPCardInterpolatorStyles}) : cardStyleInterpolator,
            presentation: Presentation.TRANSPARENT_MODAL,
            cardOverlayEnabled: false,
            cardStyle: styles.navigationScreenCardStyle,
            gestureDirection: 'horizontal',
            transitionSpec: isSmallScreenWidth ? undefined : RHP_WEB_TRANSITION_SPEC,
        },
    };
};

export default useRHPScreenOptions;
