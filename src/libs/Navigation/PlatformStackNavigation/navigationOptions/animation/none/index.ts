import type {StackNavigationOptions} from '@react-navigation/stack';
import {InternalPlatformAnimations} from '..';

const none = {animation: InternalPlatformAnimations.NONE, gestureEnabled: false} satisfies StackNavigationOptions;

export default none;
