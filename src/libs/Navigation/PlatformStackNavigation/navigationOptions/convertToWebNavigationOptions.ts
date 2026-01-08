import type {ParamListBase, ScreenOptionsOrCallback} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import buildPlatformSpecificNavigationOptions from './buildPlatformSpecificNavigationOptions';

function convertToWebNavigationOptions(screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions> | undefined): ScreenOptionsOrCallback<StackNavigationOptions> | undefined {
    if (!screenOptions) {
        return undefined;
    }

    if (isRouteBasedScreenOptions(screenOptions)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (props: PlatformStackScreenProps<ParamListBase, string>) => {
            const routeBasedScreenOptions = screenOptions(props);
            return {...buildPlatformSpecificNavigationOptions(routeBasedScreenOptions), ...routeBasedScreenOptions.web};
        };
    }

    return {...buildPlatformSpecificNavigationOptions<StackNavigationOptions>(screenOptions), ...screenOptions.web};
}

export default convertToWebNavigationOptions;
