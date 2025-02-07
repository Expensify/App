import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {PlatformSpecificNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import Animations from '..';

const fade: PlatformSpecificNavigationOptions = {animation: Animations.FADE, animationDuration: 150} satisfies NativeStackNavigationOptions;

export default fade;
