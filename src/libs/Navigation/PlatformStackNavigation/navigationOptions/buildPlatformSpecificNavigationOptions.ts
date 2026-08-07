import type {CommonStackNavigationOptions, PlatformSpecificNavigationOptions, PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

import withAnimation from './animation/withAnimation';

// Options that the platform stacks consume on their own are destructured out here. Everything else is carried over,
// which is also how nonTopScreenBehavior reaches the screen's descriptor, the only place a navigator can read it from.
const getCommonNavigationOptions = (screenOptions: PlatformStackNavigationOptions | undefined): CommonStackNavigationOptions =>
    screenOptions === undefined ? {} : (({animation, keyboardHandlingEnabled, web, native, ...rest}: PlatformStackNavigationOptions) => rest)(screenOptions);

const buildPlatformSpecificNavigationOptions = <NavigationOptions extends PlatformSpecificNavigationOptions>(screenOptions: PlatformStackNavigationOptions): NavigationOptions => ({
    keyboardHandlingEnabled: screenOptions.keyboardHandlingEnabled,
    ...withAnimation<NavigationOptions>(screenOptions),
    ...getCommonNavigationOptions(screenOptions),
});

export default buildPlatformSpecificNavigationOptions;
