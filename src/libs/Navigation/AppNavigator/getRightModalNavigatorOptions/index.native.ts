import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

const rightModalNavigatorOptions = (): PlatformStackNavigationOptions => ({
    presentation: 'card',
    animation: 'slide_from_right',
});

export default rightModalNavigatorOptions;
