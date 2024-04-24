import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';

type ResponsiveStackNavigatorRouterOptions = PlatformStackRouterOptions;

type ResponsiveStackNavigatorProps = DefaultNavigatorOptions<ParamListBase, PlatformStackNavigationState<ParamListBase>, PlatformStackNavigationOptions, PlatformStackNavigationEventMap>;

export type {ResponsiveStackNavigatorRouterOptions, ResponsiveStackNavigatorProps};
