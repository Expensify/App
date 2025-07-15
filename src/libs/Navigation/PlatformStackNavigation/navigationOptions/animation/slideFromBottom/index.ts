import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

const slideFromBottom: PlatformSpecificNavigationOptions = {
    animation: InternalPlatformAnimations.SLIDE_FROM_BOTTOM,
    gestureDirection: GestureDirection.VERTICAL,
} satisfies StackNavigationOptions;

export default slideFromBottom;
