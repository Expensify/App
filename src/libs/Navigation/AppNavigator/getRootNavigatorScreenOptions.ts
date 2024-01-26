import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import createModalCardStyleInterpolator from './createModalCardStyleInterpolator';
import getRightModalNavigatorOptions from './getRightModalNavigatorOptions';

type ScreenOptions = Record<string, NativeStackNavigationOptions>;

const commonScreenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
    animation: 'slide_from_right',
};

const SLIDE_LEFT_OUTPUT_RANGE_MULTIPLIER = -1;

type GetRootNavigatorScreenOptions = (isSmallScreenWidth: boolean, styles: ThemeStyles, StyleUtils: StyleUtilsType) => ScreenOptions;

const getRootNavigatorScreenOptions: GetRootNavigatorScreenOptions = (isSmallScreenWidth, themeStyles, StyleUtils) => {
    const modalCardStyleInterpolator = createModalCardStyleInterpolator(StyleUtils);

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            ...getRightModalNavigatorOptions(isSmallScreenWidth),
        },
        leftModalNavigator: {
            ...commonScreenOptions,
            cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, false, props, SLIDE_LEFT_OUTPUT_RANGE_MULTIPLIER),
            presentation: 'transparentModal',

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
            // Note: The card* properties won't be applied on mobile platforms, as they use the native defaults.
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),
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

            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, true, props),
            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),

                // This is necessary to cover whole screen. Including translated sidebar.
                marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
            },
        },

        centralPaneNavigator: {
            title: CONFIG.SITE_TITLE,
            ...commonScreenOptions,
            animationEnabled: isSmallScreenWidth,
            cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, true, props),

            cardStyle: {
                ...StyleUtils.getNavigationModalCardStyle(),
                paddingRight: isSmallScreenWidth ? 0 : variables.sideBarWidth,
            },
        },
    };
};

export default getRootNavigatorScreenOptions;
