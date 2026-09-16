import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {InternalPlatformAnimations} from '..';

const transition: PlatformSpecificNavigationOptions = {animation: InternalPlatformAnimations.IOS_FROM_RIGHT} satisfies NativeStackNavigationOptions;

export default transition;
