import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const rightModalNavigatorOptions = (): PlatformStackNavigationOptions => ({
    presentation: 'card',
    animation: Animations.SLIDE_FROM_RIGHT,
});

export default rightModalNavigatorOptions;
