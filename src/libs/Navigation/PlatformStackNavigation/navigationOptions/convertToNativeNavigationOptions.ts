import type {ParamListBase, ScreenOptionsOrCallback} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import buildPlatformSpecificNavigationOptions from './buildPlatformSpecificNavigationOptions';

function convertToNativeNavigationOptions(
    screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions> | undefined,
): ScreenOptionsOrCallback<NativeStackNavigationOptions> | undefined {
    if (!screenOptions) {
        return undefined;
    }

    if (isRouteBasedScreenOptions(screenOptions)) {
        return (props: PlatformStackScreenProps<ParamListBase, string>) => {
            const routeBasedScreenOptions = screenOptions(props);
            return {...buildPlatformSpecificNavigationOptions(routeBasedScreenOptions), ...routeBasedScreenOptions.native};
        };
    }

    return {...buildPlatformSpecificNavigationOptions<NativeStackNavigationOptions>(screenOptions), ...screenOptions.native};
}

export default convertToNativeNavigationOptions;
