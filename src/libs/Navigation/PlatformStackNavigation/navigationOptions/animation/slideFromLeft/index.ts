import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const slideFromLeft: PlatformSpecificNavigationOptions = {animationEnabled: true, gestureDirection: GestureDirection.HORIZONTAL_INVERTED} satisfies StackNavigationOptions;

export default slideFromLeft;
