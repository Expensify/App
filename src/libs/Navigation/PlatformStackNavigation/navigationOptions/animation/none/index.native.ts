import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {InternalPlatformAnimations} from '..';

const none = {
    animation: InternalPlatformAnimations.NONE,
    gestureEnabled: false,
} satisfies NativeStackNavigationOptions;

export default none;
