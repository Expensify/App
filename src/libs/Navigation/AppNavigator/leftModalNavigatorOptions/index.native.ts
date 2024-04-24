import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const leftModalNavigatorOptions: PlatformStackNavigationOptions = {
    animation: 'slide_from_left',
    nativeOnly: {
        customAnimationOnGesture: true,
    },
};

export default leftModalNavigatorOptions;
