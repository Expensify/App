import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {InternalPlatformAnimations} from '..';

const timingSpec = { animation: 'timing', config: { duration: 0 } } as const;

const slideFromRight: PlatformSpecificNavigationOptions = {
  animation: InternalPlatformAnimations.SLIDE_FROM_RIGHT,
  gestureDirection: 'horizontal',
  transitionSpec: { open: timingSpec, close: timingSpec },
} satisfies StackNavigationOptions;

export default slideFromRight;
