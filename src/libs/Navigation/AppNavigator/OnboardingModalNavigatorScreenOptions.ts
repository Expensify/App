import type {StackNavigationOptions} from '@react-navigation/stack';
import {CardStyleInterpolators} from '@react-navigation/stack';

/**
 * Modal stack navigator screen options generator function
 * @returns The screen options object
 */
const OnboardingModalNavigatorScreenOptions = (): StackNavigationOptions => ({
    headerShown: false,
    animationEnabled: true,
    gestureDirection: 'horizontal',
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    presentation: 'transparentModal',
});

export default OnboardingModalNavigatorScreenOptions;
