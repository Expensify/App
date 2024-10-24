import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection';
import type SlideFromLeftTransitionNavigationOptions from './types';

const slideFromLeft: SlideFromLeftTransitionNavigationOptions = {animationEnabled: true, gestureDirection: GestureDirection.HORIZONTAL_INVERTED} satisfies StackNavigationOptions;

export default slideFromLeft;
