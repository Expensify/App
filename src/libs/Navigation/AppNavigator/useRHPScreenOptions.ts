import {CardStyleInterpolators} from '@react-navigation/stack';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import {useMemo} from 'react';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types/NavigationOptions';
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

    // We have to use the isSmallScreenWidth instead of shouldUseNarrow layout, because we want to have information about screen width without the context of side modal.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Adjust props on wide layout and when the wide RHP is visible
    const shouldAdjustInterpolatorProps = !isSmallScreenWidth && wideRHPRouteKeys.length;

    return useMemo<PlatformStackNavigationOptions>(() => {
        return {
            headerShown: false,
            animation: Animations.SLIDE_FROM_RIGHT,
            gestureDirection: 'horizontal',
            web: {
                // The .forHorizontalIOS interpolator from `@react-navigation` is misbehaving on Safari, so we override it with Expensify custom interpolator
                cardStyleInterpolator: isSafari()
                    ? (props) => customInterpolator({props})
                    : (props) => CardStyleInterpolators.forHorizontalIOS(shouldAdjustInterpolatorProps ? getModifiedCardStyleInterpolatorProps(props) : props),
                presentation: Presentation.TRANSPARENT_MODAL,
                cardOverlayEnabled: false,
                cardStyle: styles.navigationScreenCardStyle,
                gestureDirection: 'horizontal',
            },
        };
    }, [customInterpolator, shouldAdjustInterpolatorProps, styles.navigationScreenCardStyle]);
};

export default useRHPScreenOptions;
