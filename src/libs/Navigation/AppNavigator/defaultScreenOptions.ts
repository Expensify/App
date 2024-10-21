import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const defaultScreenOptions: PlatformStackNavigationOptions = {
    headerShown: false,
    animationTypeForReplace: 'push',
    web: {
        cardStyle: {
            overflow: 'visible',
            flex: 1,
        },
    },
};

export default defaultScreenOptions;
