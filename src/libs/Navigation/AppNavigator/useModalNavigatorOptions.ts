import {CardStyleInterpolators} from '@react-navigation/stack';
import type {GestureDirection} from '@react-navigation/stack/lib/typescript/src/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * Modal stack navigator screen options generator function
 * @param gestureDirection - The gesture direction of dismissing the modal
 * @returns The screen options object
 */
const useModalNavigatorOptions = (gestureDirection: GestureDirection = 'horizontal'): PlatformStackNavigationOptions => {
    const themeStyles = useThemeStyles();

    let universalGestureDirection: PlatformStackNavigationOptions['gestureDirection'] | undefined;
    let webGestureDirection: GestureDirection | undefined;
    if (gestureDirection === 'horizontal' || gestureDirection === 'vertical') {
        universalGestureDirection = gestureDirection;
    } else {
        webGestureDirection = gestureDirection;
    }

    return {
        headerShown: false,
        animation: Animations.SLIDE_FROM_RIGHT,
        gestureDirection: universalGestureDirection,
        web: {
            cardStyle: themeStyles.navigationScreenCardStyle,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            ...(webGestureDirection && {gestureDirection: webGestureDirection}),
        },
    };
};

export default useModalNavigatorOptions;
