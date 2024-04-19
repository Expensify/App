import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {
    PlatformStackNavigationOptions,
    PlatformStackScreenOptionsPropsWithoutNavigation,
    PlatformStackScreenOptionsWithoutNavigation,
} from '@libs/Navigation/PlatformStackNavigation/types';
import noAnimation from './animation/native/none';
import slideFromBottomAnimation from './animation/native/slideFromBottom';
import slideFromLeftAnimation from './animation/native/slideFromLeft';
import slideFromRightAnimation from './animation/native/slideFromRight';
import withAnimation from './animation/withAnimation';
import getCommonNavigationOptions from './utils';

const transformPlatformOptionsToNative = (screenOptions: PlatformStackNavigationOptions | undefined): NativeStackNavigationOptions => ({
    ...withAnimation<NativeStackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, slideFromBottomAnimation, noAnimation),
    ...getCommonNavigationOptions(screenOptions),
});

function withNativeNavigationOptions<TStackParams extends ParamListBase, RouteName extends keyof TStackParams = keyof TStackParams>(
    screenOptions: PlatformStackScreenOptionsWithoutNavigation<TStackParams, RouteName>,
    defaultScreenOptions?: PlatformStackNavigationOptions,
) {
    return isRouteBasedScreenOptions(screenOptions)
        ? (p: PlatformStackScreenOptionsPropsWithoutNavigation<TStackParams, RouteName>) => {
              const routeBasedScreenOptions = screenOptions(p);
              return transformPlatformOptionsToNative({...defaultScreenOptions, ...routeBasedScreenOptions});
          }
        : transformPlatformOptionsToNative({...defaultScreenOptions, ...screenOptions});
}

export default withNativeNavigationOptions;
