import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {InternalPlatformAnimations} from '..';
import type NoneTransitionNavigationOptions from './types';

const none: NoneTransitionNavigationOptions = {
    animation: InternalPlatformAnimations.NONE,
    gestureEnabled: false,
} satisfies NativeStackNavigationOptions;

export default none;
