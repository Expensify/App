import type {ParamListBase} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {
    PlatformStackNavigationOptions,
    PlatformStackScreenOptionsPropsWithoutNavigation,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';
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

function withWebNavigationOptions<TStackParams extends ParamListBase, RouteName extends keyof TStackParams = keyof TStackParams>(
    screenOptions: PlatformStackScreenOptionsWithoutNavigation<TStackParams, RouteName>,
    defaultScreenOptions?: PlatformStackNavigationOptions,
) {
    return isRouteBasedScreenOptions(screenOptions)
        ? (p: PlatformStackScreenOptionsPropsWithoutNavigation<TStackParams, RouteName>) => {
              const routeBasedScreenOptions = screenOptions(p);
              return transformPlatformOptionsToWeb({...defaultScreenOptions, ...routeBasedScreenOptions});
          }
        : transformPlatformOptionsToWeb({...defaultScreenOptions, ...screenOptions});
}

export default withWebNavigationOptions;
