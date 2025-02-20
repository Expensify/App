import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

// `slide_from_right` is resolved to `default` transition on iOS, but this transition causes issues on iOS
const slideFromLeft: PlatformSpecificNavigationOptions = {animation: InternalPlatformAnimations.IOS_FROM_LEFT} satisfies NativeStackNavigationOptions;

export default slideFromLeft;
