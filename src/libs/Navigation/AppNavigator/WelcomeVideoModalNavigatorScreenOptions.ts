import type {StackNavigationOptions} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';
import type {ThemeStyles} from '@styles/index';

/**
 * Modal stack navigator screen options generator function
 * @returns The screen options object
 */
const OnboardingModalNavigatorScreenOptions = (themeStyles: ThemeStyles): StackNavigationOptions => ({
    headerShown: false,
    animationEnabled: true,
    gestureDirection: 'horizontal',
    cardStyle: themeStyles.navigationOnboardingScreenCardStyle,
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    presentation: 'transparentModal',
});

export default OnboardingModalNavigatorScreenOptions;
