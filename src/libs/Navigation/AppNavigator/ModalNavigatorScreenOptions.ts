import type {StackNavigationOptions} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';
import type {GestureDirection} from '@react-navigation/stack/lib/typescript/src/types';
import type {ThemeStyles} from '@styles/index';

/**
 * Modal stack navigator screen options generator function
 * @param themeStyles - The styles object
 * @returns The screen options object
 */
const ModalNavigatorScreenOptions = (themeStyles: ThemeStyles, gestureDirection: GestureDirection = 'horizontal'): StackNavigationOptions => ({
    headerShown: false,
    animationEnabled: true,
    gestureDirection,
    cardStyle: themeStyles.navigationScreenCardStyle,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
});

export default ModalNavigatorScreenOptions;
