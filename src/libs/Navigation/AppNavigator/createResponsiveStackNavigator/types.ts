import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
} from '@libs/Navigation/PlatformStackNavigation/types';

type ResponsiveStackNavigatorRouterOptions = PlatformStackNavigationRouterOptions;

type ResponsiveStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, PlatformStackNavigationState<ParamListBase>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap>;

export type {ResponsiveStackNavigatorRouterOptions, ResponsiveStackNavigatorProps};
