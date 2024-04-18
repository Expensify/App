import type {CommonStackNavigationOptions, PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

function getCommonNavigationOptions(screenOptions: PlatformStackNavigationOptions): CommonStackNavigationOptions {
    return (({animation, ...rest}) => rest)(screenOptions);
}

export default getCommonNavigationOptions;
