import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationOptionsRouteProps, PlatformStackNavigationOptions, PlatformStackNavigatorProps} from '@libs/Navigation/PlatformStackNavigation/types';
import slideFromLeftAnimation from './animationOptions/native/slideFromLeft';
import slideFromRightAnimation from './animationOptions/native/slideFromRight';
import withAnimation from './animationOptions/withAnimation';
import getCommonNavigationOptions from './utils';

const transformPlatformOptionsToNative = (screenOptions: PlatformStackNavigationOptions | undefined): NativeStackNavigationOptions => ({
    ...withAnimation<NativeStackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, {animation: 'slide_from_bottom'}),
    ...getCommonNavigationOptions(screenOptions),
});

function withNativeNavigationOptions<TStackParams extends ParamListBase>(screenOptions: PlatformStackNavigatorProps<TStackParams>['screenOptions']) {
    return isRouteBasedScreenOptions(screenOptions)
        ? (p: NavigationOptionsRouteProps<TStackParams>) => {
              const routeBasedScreenOptions = screenOptions(p);
              return transformPlatformOptionsToNative(routeBasedScreenOptions);
          }
        : transformPlatformOptionsToNative(screenOptions);
}

export default withNativeNavigationOptions;
