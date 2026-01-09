import type {ParamListBase, RouteProp, ScreenOptionsOrCallback} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import buildPlatformSpecificNavigationOptions from './buildPlatformSpecificNavigationOptions';

type ScreenOptionsProps = {
    route: RouteProp<ParamListBase, string>;
    navigation: unknown;
    theme: ReactNavigation.Theme;
};

function convertToWebNavigationOptions(screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions> | undefined): ScreenOptionsOrCallback<StackNavigationOptions> | undefined {
    if (!screenOptions) {
        return undefined;
    }

    if (isRouteBasedScreenOptions(screenOptions)) {
        return (props: ScreenOptionsProps) => {
            const routeBasedScreenOptions = screenOptions(props);
            return {...buildPlatformSpecificNavigationOptions(routeBasedScreenOptions), ...routeBasedScreenOptions.web};
        };
    }

    const optionsObject = screenOptions as PlatformStackNavigationOptions;
    return {...buildPlatformSpecificNavigationOptions<StackNavigationOptions>(optionsObject), ...optionsObject.web};
}

export default convertToWebNavigationOptions;
