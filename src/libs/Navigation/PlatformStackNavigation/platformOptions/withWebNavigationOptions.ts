import type {ParamListBase} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationOptionsRouteProps, PlatformStackNavigationOptions, PlatformStackNavigatorProps} from '@libs/Navigation/PlatformStackNavigation/types';
import noAnimation from './animation/web/none';
import slideFromBottomAnimation from './animation/web/slideFromBottom';
import slideFromLeftAnimation from './animation/web/slideFromLeft';
import slideFromRightAnimation from './animation/web/slideFromRight';
import withAnimation from './animation/withAnimation';
import getCommonNavigationOptions from './utils';

const transformPlatformOptionsToWeb = (screenOptions: PlatformStackNavigationOptions | undefined): StackNavigationOptions => ({
    keyboardHandlingEnabled: screenOptions?.keyboardHandlingEnabled,
    ...withAnimation<StackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, slideFromBottomAnimation, noAnimation),
    ...getCommonNavigationOptions(screenOptions),
});

function withWebNavigationOptions<TStackParams extends ParamListBase>(screenOptions: PlatformStackNavigatorProps<TStackParams>['screenOptions']) {
    return isRouteBasedScreenOptions(screenOptions)
        ? (p: NavigationOptionsRouteProps<TStackParams>) => {
              const routeBasedScreenOptions = screenOptions(p);
              return transformPlatformOptionsToWeb(routeBasedScreenOptions);
          }
        : transformPlatformOptionsToWeb(screenOptions);
}

export default withWebNavigationOptions;
