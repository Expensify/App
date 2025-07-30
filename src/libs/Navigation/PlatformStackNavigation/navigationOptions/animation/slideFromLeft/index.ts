import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

const slideFromLeft: PlatformSpecificNavigationOptions = {
    animation: InternalPlatformAnimations.SLIDE_FROM_LEFT,
    gestureDirection: GestureDirection.HORIZONTAL_INVERTED,
} satisfies StackNavigationOptions;

export default slideFromLeft;
