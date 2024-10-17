import {CardStyleInterpolators} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * Modal stack navigator screen options generator function
 * @returns The screen options object
 */
const OnboardingModalNavigatorScreenOptions = (): PlatformStackNavigationOptions => ({
    headerShown: false,
    gestureDirection: 'horizontal',
    presentation: 'transparentModal',
    web: {
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
});

export default OnboardingModalNavigatorScreenOptions;
