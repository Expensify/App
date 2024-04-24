import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {PlatformStackNavigationEventMap, PlatformStackNavigationOptions, PlatformStackNavigationState, PlatformStackRouterOptions} from '@libs/Navigation/PlatformStackNavigation/types';

type FullScreenNavigatorRouterOptions = PlatformStackRouterOptions;

type FullScreenNavigatorProps<ParamList extends ParamListBase> = DefaultNavigatorOptions<
    ParamList,
    PlatformStackNavigationState<ParamList>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
>;

export type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions};
