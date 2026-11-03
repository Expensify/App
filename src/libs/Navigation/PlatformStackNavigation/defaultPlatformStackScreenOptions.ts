import type {PlatformStackNavigationOptions} from './types';

import Animations from './navigationOptions/animation';

const defaultPlatformStackScreenOptions: PlatformStackNavigationOptions = {
    animation: Animations.SLIDE_FROM_RIGHT,
    headerShown: false,
};

export default defaultPlatformStackScreenOptions;
