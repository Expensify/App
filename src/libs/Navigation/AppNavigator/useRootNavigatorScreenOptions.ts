import type {StackCardInterpolationProps} from '@react-navigation/stack';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import {expandedRHPProgress} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
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
    workspacesListPage: PlatformStackNavigationOptions;
};

const commonScreenOptions: PlatformStackNavigationOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};

const useRootNavigatorScreenOptions = () => {
    const StyleUtils = useStyleUtils();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const themeStyles = useThemeStyles();

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
                    // Add 1 to change range from [0, 1] to [1, 2]
                    // Don't use outputMultiplier for the narrow layout
                    modalCardStyleInterpolator({
                        props,
                        shouldAnimateSidePanel: true,

                        // Adjust output range to match the wide RHP size
                        outputRangeMultiplier: isSmallScreenWidth
                            ? undefined
                            : Animated.add(Animated.multiply(expandedRHPProgress, variables.receiptPaneRHPMaxWidth / variables.sideBarWidth), 1),
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
        workspacesListPage: {
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
