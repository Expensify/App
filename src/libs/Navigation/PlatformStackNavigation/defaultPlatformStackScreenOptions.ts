import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from './types';

const defaultPlatformStackScreenOptions: PlatformStackNavigationOptions = {
    animation: Animations.SLIDE_FROM_RIGHT,
    headerShown: false,
};

export default defaultPlatformStackScreenOptions;
