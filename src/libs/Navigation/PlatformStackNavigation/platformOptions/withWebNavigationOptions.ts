import type {ParamListBase} from '@react-navigation/native';
import type {StackNavigationOptions} from '@react-navigation/stack';
import type {PlatformStackNavigationOptions, PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {PlatformStackScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types/ScreenOptions';
import {isRouteBasedScreenOptions} from '@libs/Navigation/PlatformStackNavigation/types/ScreenOptions';
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
    ...screenOptions?.web,
});

function withWebNavigationOptions<ParamList extends ParamListBase, RouteName extends keyof ParamList = keyof ParamList>(
    screenOptions: PlatformStackScreenOptions<ParamList, RouteName>,
    defaultScreenOptions?: PlatformStackNavigationOptions,
) {
    return isRouteBasedScreenOptions(screenOptions)
        ? (p: PlatformStackScreenProps<ParamList, RouteName>) => {
              const routeBasedScreenOptions = screenOptions(p);
              return transformPlatformOptionsToWeb({...defaultScreenOptions, ...routeBasedScreenOptions});
          }
        : transformPlatformOptionsToWeb({...defaultScreenOptions, ...screenOptions});
}

export default withWebNavigationOptions;
