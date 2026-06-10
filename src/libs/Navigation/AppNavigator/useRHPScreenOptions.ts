import {CardStyleInterpolators} from '@react-navigation/stack';
import type {StackCardInterpolationProps, StackCardStyleInterpolator} from '@react-navigation/stack';
import {useMemo} from 'react';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';
import useCenteredRHPModalState from './useCenteredRHPModalState';
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
    const {wideRHPRouteKeys} = useWideRHPState();
    const {isFocusedOverWidePane} = useCenteredRHPModalState();

    // We have to use the isSmallScreenWidth instead of shouldUseNarrow layout, because we want to have information about screen width without the context of side modal.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Adjust props on wide layout and when the wide RHP is visible
    const shouldAdjustInterpolatorProps = !isSmallScreenWidth && wideRHPRouteKeys.length;

    const cardStyleInterpolator = useMemo<StackCardStyleInterpolator>(() => {
        // A centered modal over a wide pane fades in place (a slide would drag its dim across the screen) instead of sliding from the side.
        if (isFocusedOverWidePane) {
            return (props) => customInterpolator({props, enter: {kind: 'fade'}});
        }
        // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
        if (isSafari()) {
            return (props) => customInterpolator({props, enter: {kind: 'slide-from-width'}});
        }
        return (props) => CardStyleInterpolators.forHorizontalIOS(shouldAdjustInterpolatorProps ? getModifiedCardStyleInterpolatorProps(props) : props);
    }, [customInterpolator, isFocusedOverWidePane, shouldAdjustInterpolatorProps]);

    return useMemo<PlatformStackNavigationOptions>(() => {
        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            gestureDirection: 'horizontal',
            web: {
                cardStyleInterpolator,
                presentation: Presentation.TRANSPARENT_MODAL,
                cardOverlayEnabled: false,
                cardStyle: styles.navigationScreenCardStyle,
                gestureDirection: 'horizontal',
            },
        };
    }, [cardStyleInterpolator, styles.navigationScreenCardStyle]);
};

export default useRHPScreenOptions;
