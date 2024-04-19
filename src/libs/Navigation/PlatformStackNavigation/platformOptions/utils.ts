import type {CommonStackNavigationOptions, PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

function getCommonNavigationOptions(screenOptions: PlatformStackNavigationOptions | undefined): CommonStackNavigationOptions {
    if (screenOptions === undefined) {
        return {};
    }

    return (({animation, ...rest}) => rest)(screenOptions);
}

export default getCommonNavigationOptions;
