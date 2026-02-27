import type {StackNavigationOptions} from '@react-navigation/stack';
import {InternalPlatformAnimations} from '..';
import type NoneTransitionNavigationOptions from './types';

const none: NoneTransitionNavigationOptions = {animation: InternalPlatformAnimations.NONE, gestureEnabled: false} satisfies StackNavigationOptions;

export default none;
