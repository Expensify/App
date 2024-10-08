import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation/index';

const transition: NativeStackNavigationOptions = {animation: Animations.IOS_FROM_RIGHT};

export default transition;
