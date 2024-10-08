import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const rightModalNavigatorOptions = (): PlatformStackNavigationOptions => ({
    presentation: Presentation.CARD,
    animation: Animations.SLIDE_FROM_RIGHT,
});

export default rightModalNavigatorOptions;
