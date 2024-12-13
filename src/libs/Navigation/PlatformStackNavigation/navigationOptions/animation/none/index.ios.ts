import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {InternalPlatformAnimations} from '..';
import type NoneTransitionNavigationOptions from './types';

const none: NoneTransitionNavigationOptions = {
    gestureEnabled: false,
    // This is a workaround, because `animation: none` does not work on iOS in `@react-navigation/native-stack@6.9.26`
    // Additionally, the `fade_from_bottom` animation seems to be the only one where `animationDuration` works
    // Upstream issue: <url>
    animation: InternalPlatformAnimations.FADE_FROM_BOTTOM,
    animationDuration: 0,
} satisfies NativeStackNavigationOptions;

export default none;
