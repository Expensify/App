import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
} from '@libs/Navigation/PlatformStackNavigation/types';

type ResponsiveStackNavigatorConfig = {
    isSmallScreenWidth: boolean;
};

type ResponsiveStackNavigatorRouterOptions = PlatformStackNavigationRouterOptions;

type ResponsiveStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, PlatformStackNavigationState<ParamListBase>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap> &
    ResponsiveStackNavigatorConfig;

export type {ResponsiveStackNavigatorRouterOptions, ResponsiveStackNavigatorProps, ResponsiveStackNavigatorConfig};
