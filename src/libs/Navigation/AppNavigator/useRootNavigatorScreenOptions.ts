import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Animations, {InternalPlatformAnimations} from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import type {EnterAnimation} from './useModalCardStyleInterpolator';

import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import RHP_WEB_TRANSITION_SPEC from './RHPTransitionSpec';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';
import useModalHorizontalSafeAreaStyle from './useModalHorizontalSafeAreaStyle';

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
    const {shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const themeStyles = useThemeStyles();
    const modalHorizontalSafeAreaStyle = useModalHorizontalSafeAreaStyle();

    const fullScreenEnter: EnterAnimation = shouldUseNarrowLayout ? {kind: 'slide-from-width'} : {kind: 'none'};
    const onboardingEnter: EnterAnimation = onboardingIsMediumOrLargerScreenWidth ? {kind: 'fade'} : {kind: 'slide-from-width'};
    const rhpEnter: EnterAnimation = shouldUseNarrowLayout ? {kind: 'slide-from-width'} : {kind: 'slide-and-fade', distancePx: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB};

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            animation: Animations.SLIDE_FROM_RIGHT,
            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            web: {
                presentation: Presentation.TRANSPARENT_MODAL,
                // The wide RHP draws its own scrim (BaseOverlay), so drop react-navigation's dark card overlay behind the floating card. Narrow keeps it, as nothing else dims the background there.
                cardOverlayEnabled: shouldUseNarrowLayout,
                cardStyleInterpolator: (props: StackCardInterpolationProps) =>
                    modalCardStyleInterpolator({
                        props,
                        enter: rhpEnter,
                        applySidePanelOffset: true,
                    }),
                transitionSpec: shouldUseNarrowLayout ? undefined : RHP_WEB_TRANSITION_SPEC,
            },
        },
        basicModalNavigator: {
            presentation: Presentation.TRANSPARENT_MODAL,
            // The screen container keeps the content out of the horizontal safe area (see useModalHorizontalSafeAreaStyle).
            hasOwnHorizontalSafeArea: true,
            native: {
                contentStyle: modalHorizontalSafeAreaStyle,
            },
            web: {
                cardOverlayEnabled: false,
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    backgroundColor: 'transparent',
                    width: '100%',
                    top: 0,
                    left: 0,
                    position: 'fixed',
                    paddingLeft: 'env(safe-area-inset-left)',
                    paddingRight: 'env(safe-area-inset-right)',
                },
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: onboardingEnter}),
            },
        },
        centeredModalNavigator: {
            presentation: Presentation.TRANSPARENT_MODAL,
            // The screen container keeps the content out of the horizontal safe area (see useModalHorizontalSafeAreaStyle).
            hasOwnHorizontalSafeArea: true,
            native: {
                contentStyle: {
                    ...StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, variables.overlayOpacity),
                    ...modalHorizontalSafeAreaStyle,
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
            // The native tab bar may sit in a side inset, so the tab navigator places the horizontal safe area itself.
            hasOwnHorizontalSafeArea: true,
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
