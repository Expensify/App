import type {StackCardInterpolationProps} from '@react-navigation/stack';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

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

        centralScreen: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            headerShown: false,
            title: CONFIG.SITE_TITLE,
            animation: shouldUseNarrowLayout ? undefined : Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true, shouldAnimateSidePanel: true}),
                cardStyle: shouldUseNarrowLayout ? StyleUtils.getNavigationModalCardStyle() : themeStyles.h100,
            },
        },
    } satisfies SplitNavigatorScreenOptions;
};

export default useSplitNavigatorScreenOptions;
