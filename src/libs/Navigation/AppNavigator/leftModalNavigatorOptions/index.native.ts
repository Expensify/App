import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const leftModalNavigatorOptions: PlatformStackNavigationOptions = {
    animation: Animations.SLIDE_FROM_LEFT,
    native: {
        customAnimationOnGesture: true,
    },
};

export default leftModalNavigatorOptions;
