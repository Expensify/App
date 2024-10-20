import type {StackCardInterpolationProps, StackNavigationOptions} from '@react-navigation/stack';
import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import createModalCardStyleInterpolator from './createModalCardStyleInterpolator';
import getModalPresentationStyle from './getModalPresentationStyle';

type GetOnboardingModalNavigatorOptions = (shouldUseNarrowLayout: boolean) => StackNavigationOptions;

type ScreenOptions = {
    rightModalNavigator: StackNavigationOptions;
    onboardingModalNavigator: GetOnboardingModalNavigatorOptions;
    leftModalNavigator: StackNavigationOptions;
    homeScreen: StackNavigationOptions;
    fullScreen: StackNavigationOptions;
    centralPaneNavigator: StackNavigationOptions;
    bottomTab: StackNavigationOptions;
};

const commonScreenOptions: StackNavigationOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
};

type GetRootNavigatorScreenOptions = (isSmallScreenWidth: boolean, styles: ThemeStyles, StyleUtils: StyleUtilsType) => ScreenOptions;

const getRootNavigatorScreenOptions: GetRootNavigatorScreenOptions = (isSmallScreenWidth, themeStyles, StyleUtils) => {
    const modalCardStyleInterpolator = createModalCardStyleInterpolator(StyleUtils);

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),
            presentation: getModalPresentationStyle(),

            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),

                // This is necessary to cover translated sidebar with overlay.
                width: isSmallScreenWidth ? '100%' : '200%',
                // Excess space should be on the left so we need to position from right.
                right: 0,
            },
        },
        onboardingModalNavigator: (shouldUseNarrowLayout: boolean) => ({
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, shouldUseNarrowLayout, props),
            headerShown: false,
            animationEnabled: true,
            cardOverlayEnabled: false,
            presentation: 'transparentModal',
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                backgroundColor: 'transparent',
                width: '100%',
                top: 0,
                left: 0,
                position: 'fixed',
            },
        }),
        leftModalNavigator: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),
            presentation: getModalPresentationStyle(),
            gestureDirection: 'horizontal-inverted',

            // We want pop in LHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),

                // This is necessary to cover translated sidebar with overlay.
                width: isSmallScreenWidth ? '100%' : '200%',

                // LHP should be displayed in place of the sidebar
                left: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
            },
        },
        homeScreen: {
            title: CONFIG.SITE_TITLE,
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),

            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,

                // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
                ...(isSmallScreenWidth ? {} : themeStyles.borderRight),
            },
        },

        fullScreen: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, true, false, props),
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),

                // This is necessary to cover whole screen. Including translated sidebar.
                marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
            },

            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animationEnabled: false,
        },

        centralPaneNavigator: {
            title: CONFIG.SITE_TITLE,
            ...commonScreenOptions,
            animationEnabled: isSmallScreenWidth,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, true, false, props),

            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                paddingRight: isSmallScreenWidth ? 0 : variables.sideBarWidth,
            },
        },

        bottomTab: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, false, props),

            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,

                // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
                ...(isSmallScreenWidth ? {} : themeStyles.borderRight),
            },
        },
    };
};

export default getRootNavigatorScreenOptions;
