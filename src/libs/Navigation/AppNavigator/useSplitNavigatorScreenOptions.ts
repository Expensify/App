import type {StackCardInterpolationProps} from '@react-navigation/stack';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

const IS_MOBILE_SAFARI = isMobileSafari();

type SplitNavigatorScreenOptions = {
    sidebarScreen: PlatformStackNavigationOptions;
    centralScreen: PlatformStackNavigationOptions;
};

const commonScreenOptions: PlatformStackNavigationOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};

const useSplitNavigatorScreenOptions = () => {
    const themeStyles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

    return {
        sidebarScreen: {
            ...commonScreenOptions,
            title: CONFIG.SITE_TITLE,
            headerShown: false,
            animation: shouldUseNarrowLayout && !IS_MOBILE_SAFARI ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            web: {
                // Note: The card* properties won't be applied on mobile platforms, as they use the native defaults.
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    width: shouldUseNarrowLayout ? '100%' : variables.sideBarWithLHBWidth,
                    marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWithLHBWidth,
                    ...(shouldUseNarrowLayout ? {} : themeStyles.borderRight),
                },
            },
        },

        centralScreen: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            headerShown: false,
            title: CONFIG.SITE_TITLE,
            animation: shouldUseNarrowLayout && !IS_MOBILE_SAFARI ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            animationTypeForReplace: 'pop',
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true, animationEnabled: !IS_MOBILE_SAFARI}),
                cardStyle: shouldUseNarrowLayout
                    ? StyleUtils.getNavigationModalCardStyle()
                    : {
                          ...themeStyles.h100,
                      },
            },
        },
    } satisfies SplitNavigatorScreenOptions;
};

export default useSplitNavigatorScreenOptions;
