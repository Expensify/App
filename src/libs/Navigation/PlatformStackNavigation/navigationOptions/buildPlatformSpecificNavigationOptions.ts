import type {CommonStackNavigationOptions, PlatformSpecificNavigationOptions, PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import withAnimation from './animation/withAnimation';

const getCommonNavigationOptions = (screenOptions: PlatformStackNavigationOptions | undefined): CommonStackNavigationOptions =>
    screenOptions === undefined ? {} : (({animation, keyboardHandlingEnabled, web, native, ...rest}: PlatformStackNavigationOptions) => rest)(screenOptions);

const buildPlatformSpecificNavigationOptions = <NavigationOptions extends PlatformSpecificNavigationOptions>(screenOptions: PlatformStackNavigationOptions): NavigationOptions => ({
    keyboardHandlingEnabled: screenOptions.keyboardHandlingEnabled,
    ...withAnimation<NavigationOptions>(screenOptions),
    ...getCommonNavigationOptions(screenOptions),
});

export default buildPlatformSpecificNavigationOptions;
