import type {StackNavigationOptions} from '@react-navigation/stack';

import type NoneTransitionNavigationOptions from './types';

import {InternalPlatformAnimations} from '..';

const none: NoneTransitionNavigationOptions = {animation: InternalPlatformAnimations.NONE, gestureEnabled: false} satisfies StackNavigationOptions;

export default none;
