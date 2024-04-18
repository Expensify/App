import type {ParamListBase} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationOptionsRouteProps, PlatformStackNavigationOptions, PlatformStackNavigatorProps} from '@libs/Navigation/PlatformStackNavigation/types';
import slideFromLeftAnimation from './animationOptions/web/slideFromLeft';
import slideFromRightAnimation from './animationOptions/web/slideFromRight';
import withAnimation from './animationOptions/withAnimation';
import getCommonNavigationOptions from './utils';

const transformPlatformOptionsToWeb = (screenOptions?: PlatformStackNavigationOptions): StackNavigationOptions => {
    if (screenOptions === undefined) {
        return {};
    }

    return {
        ...withAnimation<StackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, {}),
        ...getCommonNavigationOptions(screenOptions),
    };
};

function withWebNavigationOptions<TStackParams extends ParamListBase>(screenOptions: PlatformStackNavigatorProps<TStackParams>['screenOptions']) {
    return isRouteBasedScreenOptions(screenOptions)
        ? (p: NavigationOptionsRouteProps<TStackParams>) => {
              const routeBasedScreenOptions = screenOptions(p);
              return transformPlatformOptionsToWeb(routeBasedScreenOptions);
          }
        : transformPlatformOptionsToWeb(screenOptions);
}

export default withWebNavigationOptions;
