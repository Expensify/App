import type {StackCardInterpolationProps} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import createModalCardStyleInterpolator from './createModalCardStyleInterpolator';
import getRightModalNavigatorOptions from './getRightModalNavigatorOptions';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import leftModalNavigatorOptions from './leftModalNavigatorOptions';

type GetOnboardingModalNavigatorOptions = (shouldUseNarrowLayout: boolean) => PlatformStackNavigationOptions;

type ScreenOptions = {
    rightModalNavigator: PlatformStackNavigationOptions;
    onboardingModalNavigator: GetOnboardingModalNavigatorOptions;
    leftModalNavigator: PlatformStackNavigationOptions;
    homeScreen: PlatformStackNavigationOptions;
    fullScreen: PlatformStackNavigationOptions;
    centralPaneNavigator: PlatformStackNavigationOptions;
    bottomTab: PlatformStackNavigationOptions;
};

const commonScreenOptions: PlatformStackNavigationOptions = {
    headerShown: false,
    webOnly: {
        cardOverlayEnabled: true,
    },
};

type GetRootNavigatorScreenOptions = (isSmallScreenWidth: boolean, styles: ThemeStyles, StyleUtils: StyleUtilsType) => ScreenOptions;

const getRootNavigatorScreenOptions: GetRootNavigatorScreenOptions = (isSmallScreenWidth, themeStyles, StyleUtils) => {
    const modalCardStyleInterpolator = createModalCardStyleInterpolator(StyleUtils);

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            ...getRightModalNavigatorOptions(isSmallScreenWidth),
            ...hideKeyboardOnSwipe,
            webOnly: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),
            },
        },
        onboardingModalNavigator: (shouldUseNarrowLayout: boolean) => ({
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, shouldUseNarrowLayout, props),
            headerShown: false,
            animationEnabled: true,
            cardOverlayEnabled: false,
            presentation: 'transparentModal',
            webOnly: {
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    backgroundColor: 'transparent',
                    width: '100%',
                    top: 0,
                    left: 0,
                    position: 'fixed',
                },
            },
        }),
        leftModalNavigator: {
            ...commonScreenOptions,
            ...leftModalNavigatorOptions,
            animationTypeForReplace: 'pop',
            webOnly: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),
                // We want pop in LHP since there are some flows that would work weird otherwise
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),

                    // This is necessary to cover translated sidebar with overlay.
                    width: isSmallScreenWidth ? '100%' : '200%',

                    // LHP should be displayed in place of the sidebar
                    left: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
                },
            },
        },
        homeScreen: {
            ...commonScreenOptions,
            title: CONFIG.SITE_TITLE,
            webOnly: {
                // Note: The card* properties won't be applied on mobile platforms, as they use the native defaults.
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,

                    // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                    marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
                    ...(isSmallScreenWidth ? {} : themeStyles.borderRight),
                },
            },
        },

        fullScreen: {
            ...commonScreenOptions,
            animation: 'slide_from_right',
            webOnly: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, true, false, props),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),

                    // This is necessary to cover whole screen. Including translated sidebar.
                    marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
                },
            },

            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animationEnabled: isSmallScreenWidth,
        },

        centralPaneNavigator: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            title: CONFIG.SITE_TITLE,
            animation: isSmallScreenWidth ? undefined : 'none',
            webOnly: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, true, false, props),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    paddingRight: isSmallScreenWidth ? 0 : variables.sideBarWidth,
                },
            },
        },

        bottomTab: {
            ...commonScreenOptions,
            webOnly: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,

                    // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                    marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
                    ...(isSmallScreenWidth ? {} : themeStyles.borderRight),
                },
            },
        },
    } satisfies ScreenOptions;
};

export default getRootNavigatorScreenOptions;
