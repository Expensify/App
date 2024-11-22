import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection';
import type SlideFromBottomTransitionNavigationOptions from './types';

const slideFromBottom: SlideFromBottomTransitionNavigationOptions = {animationEnabled: true, gestureDirection: GestureDirection.VERTICAL} satisfies StackNavigationOptions;

export default slideFromBottom;
