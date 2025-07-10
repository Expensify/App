import type {CommonStackNavigationOptions, PlatformSpecificNavigationOptions, PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import withAnimation from './animation/withAnimation';

const getCommonNavigationOptions = (screenOptions: PlatformStackNavigationOptions | undefined): CommonStackNavigationOptions => {
    const {animation, contentStyle, web, native, ...commonOptions} = screenOptions ?? {};
    return commonOptions;
};

const buildPlatformSpecificNavigationOptions = <NavigationOptions extends PlatformSpecificNavigationOptions>(screenOptions: PlatformStackNavigationOptions): NavigationOptions => ({
    ...withAnimation<NavigationOptions>(screenOptions),
    ...getCommonNavigationOptions(screenOptions),
});

export default buildPlatformSpecificNavigationOptions;
