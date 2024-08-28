import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const leftModalNavigatorOptions: PlatformStackNavigationOptions = {
    animation: 'slide_from_left',
    native: {
        customAnimationOnGesture: true,
    },
};

export default leftModalNavigatorOptions;
