import {StackCardInterpolationProps, StackNavigationOptions} from '@react-navigation/stack';
import {ThemeStyles} from '@styles/index';
import getNavigationModalCardStyle from '@styles/utils/getNavigationModalCardStyles';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';

type ScreenOptions = Record<string, StackNavigationOptions>;

const commonScreenOptions: StackNavigationOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
};

export default (isSmallScreenWidth: boolean, themeStyles: ThemeStyles): ScreenOptions => ({
    rightModalNavigator: {
        ...commonScreenOptions,
        cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),
        presentation: 'transparentModal',

        // We want pop in RHP since there are some flows that would work weird otherwise
        animationTypeForReplace: 'pop',
        cardStyle: {
            ...getNavigationModalCardStyle(),

            // This is necessary to cover translated sidebar with overlay.
            width: isSmallScreenWidth ? '100%' : '200%',
            // Excess space should be on the left so we need to position from right.
            right: 0,
        },
    },

    homeScreen: {
        title: CONFIG.SITE_TITLE,
        ...commonScreenOptions,
        cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),

        cardStyle: {
            ...getNavigationModalCardStyle(),
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
            ...getNavigationModalCardStyle(),

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
            ...getNavigationModalCardStyle(),
            paddingRight: isSmallScreenWidth ? 0 : variables.sideBarWidth,
        },
    },
});
