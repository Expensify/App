import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const leftModalNavigatorOptions: PlatformStackNavigationOptions = {
    presentation: 'transparentModal',
    animation: Animations.SLIDE_FROM_LEFT,
    // customAnimationOnGesture: true,
};

export default leftModalNavigatorOptions;
