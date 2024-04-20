import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
} from '@libs/Navigation/PlatformStackNavigation/types';

type FullScreenNavigatorRouterOptions = PlatformStackNavigationRouterOptions;

type FullScreenNavigatorProps<ParamList extends ParamListBase> = DefaultNavigatorOptions<
    ParamList,
    PlatformStackNavigationState<ParamList>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
>;

export type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions};
