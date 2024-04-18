import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const defaultScreenOptions: PlatformStackNavigationOptions = {
    cardStyle: {
        overflow: 'visible',
        flex: 1,
    },
    headerShown: false,
    animationTypeForReplace: 'push',
};

export default defaultScreenOptions;
