import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

const slideFromRight: PlatformSpecificNavigationOptions = {animation: InternalPlatformAnimations.SLIDE_FROM_RIGHT, gestureDirection: 'horizontal'} satisfies StackNavigationOptions;

export default slideFromRight;
