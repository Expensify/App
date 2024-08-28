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
    const universalGestureDirection = gestureDirection === 'horizontal' || gestureDirection === 'vertical' ? gestureDirection : undefined;
    const webGestureDirection = gestureDirection !== 'horizontal' && gestureDirection !== 'vertical' ? gestureDirection : undefined;

    return {
        headerShown: false,
        animation: 'slide_from_left',
        gestureDirection: universalGestureDirection,
        webOnly: {
            cardStyle: themeStyles.navigationScreenCardStyle,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            // TODO: Fix web/native only additional types
            gestureDirection: webGestureDirection,
        },
    };
};

export default ModalNavigatorScreenOptions;
