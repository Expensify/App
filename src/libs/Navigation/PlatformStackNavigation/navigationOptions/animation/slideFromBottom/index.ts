import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '../../gestureDirection';

const slideFromBottom: StackNavigationOptions = {animationEnabled: true, gestureDirection: GestureDirection.VERTICAL};

export default slideFromBottom;
