import type {ParamListBase, RouteProp, ScreenOptionsOrCallback} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import noAnimation from './animation/web/none';
import slideFromBottomAnimation from './animation/web/slideFromBottom';
import slideFromLeftAnimation from './animation/web/slideFromLeft';
import slideFromRightAnimation from './animation/web/slideFromRight';
import withAnimation from './animation/withAnimation';
import getCommonNavigationOptions from './utils';

const transformPlatformOptionsToWeb = (screenOptions: PlatformStackNavigationOptions): StackNavigationOptions => ({
    keyboardHandlingEnabled: screenOptions.keyboardHandlingEnabled,
    ...withAnimation<StackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, slideFromBottomAnimation, noAnimation),
    ...getCommonNavigationOptions(screenOptions),
    ...screenOptions.web,
});

function withWebNavigationOptions(screenOptions: ScreenOptionsOrCallback<PlatformStackNavigationOptions> | undefined): ScreenOptionsOrCallback<StackNavigationOptions> | undefined {
    if (screenOptions === undefined) {
        return undefined;
    }

    if (isRouteBasedScreenOptions(screenOptions)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (p: {route: RouteProp<ParamListBase, string>; navigation: any}) => {
            const routeBasedScreenOptions = screenOptions(p);
            return transformPlatformOptionsToWeb(routeBasedScreenOptions);
        };
    }

    return transformPlatformOptionsToWeb(screenOptions);
}

export default withWebNavigationOptions;
