import {CardStyleInterpolators} from '@react-navigation/stack';
import type {GestureDirection} from '@react-navigation/stack/lib/typescript/src/types';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ThemeStyles} from '@styles/index';

/**
 * Modal stack navigator screen options generator function
 * @param themeStyles - The styles object
 * @returns The screen options object
 */
const ModalNavigatorScreenOptions = (themeStyles: ThemeStyles, gestureDirection: GestureDirection = 'horizontal'): PlatformStackNavigationOptions => {
    let universalGestureDirection: PlatformStackNavigationOptions['gestureDirection'] | undefined;
    let webGestureDirection: GestureDirection | undefined;
    if (gestureDirection === 'horizontal' || gestureDirection === 'vertical') {
        universalGestureDirection = gestureDirection;
    } else {
        webGestureDirection = gestureDirection;
    }

    return {
        headerShown: false,
        animation: 'slide_from_right',
        gestureDirection: universalGestureDirection,
        web: {
            cardStyle: themeStyles.navigationScreenCardStyle,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            gestureDirection: webGestureDirection,
        },
    };
};

export default ModalNavigatorScreenOptions;
