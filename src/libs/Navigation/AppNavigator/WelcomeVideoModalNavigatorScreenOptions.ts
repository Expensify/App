import type {StackNavigationOptions} from '@react-navigation/stack';

/**
 * Modal stack navigator screen options generator function
 * @returns The screen options object
 */
const WelcomeVideoModalNavigatorScreenOptions = (): StackNavigationOptions => ({
    headerShown: false,
    animationEnabled: true,
});

export default WelcomeVideoModalNavigatorScreenOptions;
