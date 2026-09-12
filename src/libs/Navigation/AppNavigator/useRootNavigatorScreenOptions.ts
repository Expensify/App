import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Animations, {InternalPlatformAnimations} from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import variables from '@styles/variables';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import type {EnterAnimation} from './useModalCardStyleInterpolator';

import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import RHP_WEB_TRANSITION_SPEC from './RHPTransitionSpec';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';
import {useRootRHPCardStyleInterpolator} from './useRHPTransition';

type RootNavigatorScreenOptions = {
    rightModalNavigator: PlatformStackNavigationOptions;
    centeredModalNavigator: PlatformStackNavigationOptions;
    basicModalNavigator: PlatformStackNavigationOptions;
    splitNavigator: PlatformStackNavigationOptions;
    fullScreen: PlatformStackNavigationOptions;
    fullScreenTabPage: PlatformStackNavigationOptions;
};

const commonScreenOptions: PlatformStackNavigationOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};

const useRootNavigatorScreenOptions = () => {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    const rhpCardStyleInterpolator = useRootRHPCardStyleInterpolator();
    const {shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const themeStyles = useThemeStyles();

    const fullScreenEnter: EnterAnimation = shouldUseNarrowLayout ? {kind: 'slide-from-width'} : {kind: 'none'};
    const onboardingEnter: EnterAnimation = onboardingIsMediumOrLargerScreenWidth ? {kind: 'fade'} : {kind: 'slide-from-width'};

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            animation: Animations.SLIDE_FROM_RIGHT,
            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            web: {
                presentation: Presentation.TRANSPARENT_MODAL,
                cardStyleInterpolator: rhpCardStyleInterpolator,
                transitionSpec: shouldUseNarrowLayout ? undefined : RHP_WEB_TRANSITION_SPEC,
            },
        },
        basicModalNavigator: {
            presentation: Presentation.TRANSPARENT_MODAL,
            web: {
                cardOverlayEnabled: false,
                cardStyle: StyleUtils.getStyleWithEnvSafeAreaPadding({
                    ...StyleUtils.getNavigationModalCardStyle(),
                    ...themeStyles.modalStackNavigatorContainer,
                    backgroundColor: 'transparent',
                    width: '100%',
                    top: 0,
                    left: 0,
                }),
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: onboardingEnter}),
            },
        },
        centeredModalNavigator: {
            presentation: Presentation.TRANSPARENT_MODAL,
            web: {
                cardStyle: {
                    ...StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, variables.overlayOpacity),
                },
            },
            animation: InternalPlatformAnimations.FADE,
        },
        splitNavigator: {
            ...commonScreenOptions,
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: fullScreenEnter, applySidePanelOffset: true}),
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
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: fullScreenEnter}),
            },
        },
        fullScreenTabPage: {
            ...commonScreenOptions,
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: {kind: 'none'}, applySidePanelOffset: true}),
                cardStyle: shouldUseNarrowLayout ? StyleUtils.getStyleWithEnvSafeAreaPadding(StyleUtils.getNavigationModalCardStyle()) : {...themeStyles.h100, width: '100%'},
            },
        },
    } satisfies RootNavigatorScreenOptions;
};

export default useRootNavigatorScreenOptions;
