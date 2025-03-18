import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

// default transition is causing weird keyboard appearance: - https://github.com/Expensify/App/issues/37257
// so we are using `simple_push` which is similar to default and not causing keyboard transition issues
const transition: PlatformSpecificNavigationOptions = {animation: InternalPlatformAnimations.SIMPLE_PUSH} satisfies NativeStackNavigationOptions;

export default transition;
