import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import type NoneTransitionNavigationOptions from './types';

import {InternalPlatformAnimations} from '..';

const none: NoneTransitionNavigationOptions = {
    animation: InternalPlatformAnimations.NONE,
    gestureEnabled: false,
} satisfies NativeStackNavigationOptions;

export default none;
