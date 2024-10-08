import type {StackNavigationOptions} from '@react-navigation/stack';
import GestureDirection from '@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection';

const slideFromBottom: StackNavigationOptions = {animationEnabled: true, gestureDirection: GestureDirection.VERTICAL};

export default slideFromBottom;
