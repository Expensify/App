import type {StackCardInterpolationProps, StackNavigationOptions} from '@react-navigation/stack';
import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import createModalCardStyleInterpolator from './createModalCardStyleInterpolator';

type ScreenOptions = Record<string, StackNavigationOptions>;

const commonScreenOptions: StackNavigationOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
};

const SLIDE_LEFT_OUTPUT_RANGE_MULTIPLIER = -1;

type GetRootNavigatorScreenOptions = (shouldUseNarrowLayout: boolean, styles: ThemeStyles, StyleUtils: StyleUtilsType) => ScreenOptions;

const getRootNavigatorScreenOptions: GetRootNavigatorScreenOptions = (shouldUseNarrowLayout, themeStyles, StyleUtils) => {
    const modalCardStyleInterpolator = createModalCardStyleInterpolator(StyleUtils);

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(shouldUseNarrowLayout, false, props),
            presentation: 'transparentModal',

            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),

                // This is necessary to cover translated sidebar with overlay.
                width: shouldUseNarrowLayout ? '100%' : '200%',
                // Excess space should be on the left so we need to position from right.
                right: 0,
            },
        },
        leftModalNavigator: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props) => modalCardStyleInterpolator(shouldUseNarrowLayout, false, props, SLIDE_LEFT_OUTPUT_RANGE_MULTIPLIER),
            presentation: 'transparentModal',

            // We want pop in LHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),

                // This is necessary to cover translated sidebar with overlay.
                width: shouldUseNarrowLayout ? '100%' : '200%',

                // LHP should be displayed in place of the sidebar
                left: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
            },
        },
        homeScreen: {
            title: CONFIG.SITE_TITLE,
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(shouldUseNarrowLayout, false, props),

            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                width: shouldUseNarrowLayout ? '100%' : variables.sideBarWidth,

                // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
                ...(shouldUseNarrowLayout ? {} : themeStyles.borderRight),
            },
        },

        fullScreen: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(shouldUseNarrowLayout, true, props),
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),

                // This is necessary to cover whole screen. Including translated sidebar.
                marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
            },
        },

        centralPaneNavigator: {
            title: CONFIG.SITE_TITLE,
            ...commonScreenOptions,
            animationEnabled: shouldUseNarrowLayout,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(shouldUseNarrowLayout, true, props),

            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                paddingRight: shouldUseNarrowLayout ? 0 : variables.sideBarWidth,
            },
        },

        bottomTab: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(shouldUseNarrowLayout, false, props),

            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                width: shouldUseNarrowLayout ? '100%' : variables.sideBarWidth,

                // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
                ...(shouldUseNarrowLayout ? {} : themeStyles.borderRight),
            },
        },
    };
};

export default getRootNavigatorScreenOptions;
