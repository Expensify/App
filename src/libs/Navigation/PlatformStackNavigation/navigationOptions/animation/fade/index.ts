import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

const fade: PlatformSpecificNavigationOptions = {animation: InternalPlatformAnimations.FADE, animationDuration: 150} satisfies NativeStackNavigationOptions;

export default fade;
