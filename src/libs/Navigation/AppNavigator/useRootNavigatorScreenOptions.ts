import type {StackCardInterpolationProps} from '@react-navigation/stack';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';

type RootNavigatorScreenOptions = {
    rightModalNavigator: PlatformStackNavigationOptions;
    basicModalNavigator: PlatformStackNavigationOptions;
    leftModalNavigator: PlatformStackNavigationOptions;
    splitNavigator: PlatformStackNavigationOptions;
    fullScreen: PlatformStackNavigationOptions;
};

const commonScreenOptions: PlatformStackNavigationOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};

const useRootNavigatorScreenOptions = () => {
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

    return {
        rightModalNavigator: {
            ...commonScreenOptions,
            ...hideKeyboardOnSwipe,
            animation: Animations.SLIDE_FROM_RIGHT,
            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop',
            web: {
                presentation: Presentation.TRANSPARENT_MODAL,
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, shouldAnimateSidePanel: true}),
            },
        },
        basicModalNavigator: {
            presentation: Presentation.TRANSPARENT_MODAL,
            web: {
                cardOverlayEnabled: false,
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),
                    backgroundColor: 'transparent',
                    width: '100%',
                    top: 0,
                    left: 0,
                    position: 'fixed',
                },
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isOnboardingModal: true}),
            },
        },
        leftModalNavigator: {
            ...commonScreenOptions,
            animation: Animations.SLIDE_FROM_LEFT,
            animationTypeForReplace: 'pop',
            native: {
                customAnimationOnGesture: true,
            },
            web: {
                presentation: Presentation.TRANSPARENT_MODAL,
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}),
                // We want pop in LHP since there are some flows that would work weird otherwise
                cardStyle: {
                    ...StyleUtils.getNavigationModalCardStyle(),

                    // This is necessary to cover translated sidebar with overlay.
                    width: shouldUseNarrowLayout ? '100%' : '200%',
                },
            },
        },
        splitNavigator: {
            ...commonScreenOptions,
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: shouldUseNarrowLayout ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            web: {
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true}),
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
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true, shouldAnimateSidePanel: true}),
            },
        },
    } satisfies RootNavigatorScreenOptions;
};

export default useRootNavigatorScreenOptions;
