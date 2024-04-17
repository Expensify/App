import {CardStyleInterpolators} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ThemeStyles} from '@styles/index';

/**
 * Modal stack navigator screen options generator function
 * @param themeStyles - The styles object
 * @returns The screen options object
 */
const ModalNavigatorScreenOptions = (themeStyles: ThemeStyles): PlatformStackNavigationOptions => ({
    headerShown: false,
    animationEnabled: true,
    gestureDirection: 'horizontal',
    cardStyle: themeStyles.navigationScreenCardStyle,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
});

export default ModalNavigatorScreenOptions;
