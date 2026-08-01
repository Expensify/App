import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {InternalPlatformAnimations} from '..';

const slideFromBottom: PlatformSpecificNavigationOptions = {animation: InternalPlatformAnimations.SLIDE_FROM_BOTTOM} satisfies NativeStackNavigationOptions;

export default slideFromBottom;
