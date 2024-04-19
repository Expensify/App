import type {DefaultNavigatorOptions, ParamListBase, StackRouterOptions} from '@react-navigation/native';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';

type ResponsiveStackNavigatorConfig = {
    isSmallScreenWidth: boolean;
};

type ResponsiveStackNavigatorRouterOptions = StackRouterOptions;

type ResponsiveStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, PlatformStackNavigationState<ParamListBase>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap> &
    ResponsiveStackNavigatorConfig;

export type {ResponsiveStackNavigatorRouterOptions, ResponsiveStackNavigatorProps, ResponsiveStackNavigatorConfig};
