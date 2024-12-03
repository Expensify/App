import type {StackCardInterpolationProps} from '@react-navigation/stack';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

type RootNavigatorOptions = {
    rightModalNavigator: PlatformStackNavigationOptions;
    basicModalNavigator: PlatformStackNavigationOptions;
    leftModalNavigator: PlatformStackNavigationOptions;
    homeScreen: PlatformStackNavigationOptions;
    fullScreen: PlatformStackNavigationOptions;
    centralPaneNavigator: PlatformStackNavigationOptions;
    bottomTab: PlatformStackNavigationOptions;
};

const commonScreenOptions: PlatformStackNavigationOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};

const useRootNavigatorOptions = () => {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            animation: Animations.SLIDE_FROM_RIGHT,
            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            web: {
                presentation: Presentation.TRANSPARENT_MODAL,
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    // This is necessary to cover translated sidebar with overlay.
                    width: shouldUseNarrowLayout ? '100%' : '200%',
                    // Excess space should be on the left so we need to position from right.
                    right: 0,
                },
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}),
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
        leftModalNavigator: {
            ...commonScreenOptions,
            animation: Animations.SLIDE_FROM_LEFT,
            animationTypeForReplace: 'pop',
            native: {
                customAnimationOnGesture: true,
            },
            web: {
                presentation: Presentation.TRANSPARENT_MODAL,
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}),
                // We want pop in LHP since there are some flows that would work weird otherwise
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),

                    // This is necessary to cover translated sidebar with overlay.
                    width: shouldUseNarrowLayout ? '100%' : '200%',

                    // LHP should be displayed in place of the sidebar
                    left: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
                },
            },
        },
        homeScreen: {
            ...commonScreenOptions,
            title: CONFIG.SITE_TITLE,
            headerShown: false,
            web: {
                // Note: The card* properties won't be applied on mobile platforms, as they use the native defaults.
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    width: shouldUseNarrowLayout ? '100%' : variables.sideBarWidth,

                    // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                    marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
                    ...(shouldUseNarrowLayout ? {} : themeStyles.borderRight),
                },
            },
        },

        fullScreen: {
            ...commonScreenOptions,
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: shouldUseNarrowLayout ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true}),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),

                    // This is necessary to cover whole screen. Including translated sidebar.
                    marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
                },
            },
        },

        centralPaneNavigator: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            headerShown: false,
            title: CONFIG.SITE_TITLE,
            animation: shouldUseNarrowLayout ? undefined : Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true}),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    paddingRight: shouldUseNarrowLayout ? 0 : variables.sideBarWidth,
                },
            },
        },

        bottomTab: {
            ...commonScreenOptions,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    width: shouldUseNarrowLayout ? '100%' : variables.sideBarWidth,

                    // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                    marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
                    ...(shouldUseNarrowLayout ? {} : themeStyles.borderRight),
                },
            },
        },
    } satisfies RootNavigatorOptions;
};

export default useRootNavigatorOptions;
