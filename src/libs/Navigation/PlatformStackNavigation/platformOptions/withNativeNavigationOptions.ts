import type {ParamListBase} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PlatformStackScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types/ScreenOptions';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types/ScreenOptions';
import noAnimation from './animation/native/none';
import slideFromBottomAnimation from './animation/native/slideFromBottom';
import slideFromLeftAnimation from './animation/native/slideFromLeft';
import slideFromRightAnimation from './animation/native/slideFromRight';
import withAnimation from './animation/withAnimation';
import getCommonNavigationOptions from './utils';

const transformPlatformOptionsToNative = (screenOptions: PlatformStackNavigationOptions | undefined): NativeStackNavigationOptions => ({
    keyboardHandlingEnabled: screenOptions?.keyboardHandlingEnabled,
    ...withAnimation<NativeStackNavigationOptions>(screenOptions, slideFromLeftAnimation, slideFromRightAnimation, slideFromBottomAnimation, noAnimation),
    ...getCommonNavigationOptions(screenOptions),
    ...screenOptions?.native,
});

function withNativeNavigationOptions<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList>(
    screenOptions: PlatformStackScreenOptions<ParamList, RouteName>,
    defaultScreenOptions?: PlatformStackNavigationOptions,
) {
    return isRouteBasedScreenOptions(screenOptions)
        ? (p: PlatformStackScreenProps<ParamList, RouteName>) => {
              const routeBasedScreenOptions = screenOptions(p);
              return transformPlatformOptionsToNative({...defaultScreenOptions, ...routeBasedScreenOptions});
          }
        : transformPlatformOptionsToNative({...defaultScreenOptions, ...screenOptions});
}

export default withNativeNavigationOptions;
