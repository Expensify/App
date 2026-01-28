import type {StackCardInterpolationProps} from '@react-navigation/stack';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import {expandedRHPProgress} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

type RootNavigatorScreenOptions = {
    rightModalNavigator: PlatformStackNavigationOptions;
    basicModalNavigator: PlatformStackNavigationOptions;
    splitNavigator: PlatformStackNavigationOptions;
    fullScreen: PlatformStackNavigationOptions;
    fullScreenTabPage: PlatformStackNavigationOptions;
};

const commonScreenOptions: PlatformStackNavigationOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};

function abs(a: Animated.AnimatedSubtraction<number | string>) {
    const b = Animated.multiply(a, -1);
    const clampedA = Animated.diffClamp(a, 0, Number.MAX_SAFE_INTEGER);
    const clampedB = Animated.diffClamp(b, 0, Number.MAX_SAFE_INTEGER);

    return Animated.add(clampedA, clampedB);
}

const useRootNavigatorScreenOptions = () => {
    const StyleUtils = useStyleUtils();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const themeStyles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            animation: Animations.SLIDE_FROM_RIGHT,
            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            web: {
                presentation: Presentation.TRANSPARENT_MODAL,
                cardStyleInterpolator: (props: StackCardInterpolationProps) =>
                    // Don't use outputMultiplier for the narrow layout
                    modalCardStyleInterpolator({
                        props,
                        shouldAnimateSidePanel: true,
                        // On a wide layout, the output range multiplier is multiplied inside useModalCardStyleInterpolator by the width of a single RHP.
                        // Depending on the value of expandedRHPProgress, after multiplication the appropriate RHP width should be obtained.
                        // To achieve this, the following function was used:
                        // y = (1 - |x - 1|) * receiptPaneWidth/sidebarWidth + Max((x - 1), 0)) * (superWideRHPWidth / sidebarWidth - 1) + 1
                        // For expandedRHPProgress equal to:
                        // 0 - Single RHP, y = 1
                        // 1 - Wide RHP, y = receiptPaneWidth / sidebarWidth + 1
                        // 2 - Super Wide RHP, y = superWideRHPWidth / sidebarWidth
                        // For the given values, after multiplying by sidebarWidth inside useModalCardStyleInterpolator, the correct widths are obtained.
                        outputRangeMultiplier: isSmallScreenWidth
                            ? undefined
                            : Animated.add(
                                  Animated.add(
                                      Animated.multiply(Animated.subtract(1, abs(Animated.subtract(1, expandedRHPProgress))), variables.receiptPaneRHPMaxWidth / variables.sideBarWidth),
                                      Animated.multiply(
                                          expandedRHPProgress.interpolate({inputRange: [1, 2], outputRange: [0, 1], extrapolate: 'clamp'}),
                                          calculateSuperWideRHPWidth(windowWidth) / variables.sideBarWidth - 1,
                                      ),
                                  ),
                                  1,
                              ),
                    }),
            },
        },
        basicModalNavigator: {
            presentation: Presentation.TRANSPARENT_MODAL,
            web: {
                cardOverlayEnabled: false,
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    backgroundColor: 'transparent',
                    width: '100%',
                    top: 0,
                    left: 0,
                    position: 'fixed',
                },
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isOnboardingModal: true}),
            },
        },
        splitNavigator: {
            ...commonScreenOptions,
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true}),
                cardStyle: StyleUtils.getNavigationModalCardStyle(),
            },
        },
        fullScreen: {
            ...commonScreenOptions,
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: Animations.NONE,
            web: {
                cardStyle: {
                    height: '100%',
                },
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true}),
            },
        },
        fullScreenTabPage: {
            ...commonScreenOptions,
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) =>
                    modalCardStyleInterpolator({props, isFullScreenModal: true, animationEnabled: false, shouldAnimateSidePanel: true}),
                cardStyle: shouldUseNarrowLayout ? {...StyleUtils.getNavigationModalCardStyle(), paddingLeft: 0} : {...themeStyles.h100, paddingLeft: variables.navigationTabBarSize},
            },
        },
    } satisfies RootNavigatorScreenOptions;
};

export default useRootNavigatorScreenOptions;
