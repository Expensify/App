import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '../../gestureDirection';

const slideFromLeft: StackNavigationOptions = {animationEnabled: true, gestureDirection: GestureDirection.HORIZONTAL_INVERTED};

export default slideFromLeft;
