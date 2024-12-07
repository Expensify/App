import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const slideFromBottom: PlatformSpecificNavigationOptions = {animationEnabled: true, gestureDirection: GestureDirection.VERTICAL} satisfies StackNavigationOptions;

export default slideFromBottom;
