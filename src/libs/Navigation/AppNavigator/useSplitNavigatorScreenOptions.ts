import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobileSafari} from '@libs/Browser';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import variables from '@styles/variables';

import CONFIG from '@src/CONFIG';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import type {EnterAnimation} from './useModalCardStyleInterpolator';

import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

const IS_MOBILE_SAFARI = isMobileSafari();

// `dvw` instead of `%`: a percentage resolves against the transformed parent card, whose box already has the gutters removed, insetting them twice.
const NARROW_CARD_SAFE_AREA_WIDTH = 'calc(100dvw - env(safe-area-inset-left) - env(safe-area-inset-right))';

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

    const centralScreenEnter: EnterAnimation = !IS_MOBILE_SAFARI && shouldUseNarrowLayout ? {kind: 'slide-from-width'} : {kind: 'none'};

    return {
        sidebarScreen: {
            ...commonScreenOptions,
            title: CONFIG.SITE_TITLE,
            headerShown: false,
            animation: shouldUseNarrowLayout && !IS_MOBILE_SAFARI ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            web: {
                // Note: The card* properties won't be applied on mobile platforms, as they use the native defaults.
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: {kind: 'slide-from-width'}}),
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    width: shouldUseNarrowLayout ? NARROW_CARD_SAFE_AREA_WIDTH : variables.sideBarWithLHBWidth,
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
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: centralScreenEnter}),
                cardStyle: shouldUseNarrowLayout
                    ? {...StyleUtils.getNavigationModalCardStyle(), width: NARROW_CARD_SAFE_AREA_WIDTH}
                    : {
                          ...themeStyles.h100,
                      },
            },
        },
    } satisfies SplitNavigatorScreenOptions;
};

export default useSplitNavigatorScreenOptions;
