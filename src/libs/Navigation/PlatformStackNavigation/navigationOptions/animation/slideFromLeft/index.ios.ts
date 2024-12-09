import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

// default transition is causing weird keyboard appearance: - https://github.com/Expensify/App/issues/37257
// so we are using `slide_from_left` which is similar to default and not causing keyboard transition issues
const slideFromLeft: PlatformSpecificNavigationOptions = {animation: InternalPlatformAnimations.SLIDE_FROM_LEFT} satisfies NativeStackNavigationOptions;

export default slideFromLeft;
