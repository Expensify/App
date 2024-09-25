import type {ParamListBase, ScreenOptionsOrCallback} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import buildPlatformSpecificNavigationOptions from './buildPlatformSpecificNavigationOptions';

function convertToWebNavigationOptions(screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions> | undefined): ScreenOptionsOrCallback<StackNavigationOptions> | undefined {
    if (screenOptions === undefined) {
        return undefined;
    }

    if (isRouteBasedScreenOptions(screenOptions)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (p: PlatformStackScreenProps<ParamListBase, string>) => {
            const routeBasedScreenOptions = screenOptions(p);
            return {...buildPlatformSpecificNavigationOptions(routeBasedScreenOptions), ...routeBasedScreenOptions.web};
        };
    }

    return {...buildPlatformSpecificNavigationOptions<StackNavigationOptions>(screenOptions), ...screenOptions.web};
}

export default convertToWebNavigationOptions;
