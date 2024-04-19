import type {DefaultNavigatorOptions, ParamListBase} from '@react-navigation/native';
import type {
    PlatformStackNavigationEventMap,
    PlatformStackNavigationOptions,
    PlatformStackNavigationRouterOptions,
    PlatformStackNavigationState,
} from '@libs/Navigation/PlatformStackNavigation/types';

type FullScreenNavigatorRouterOptions = PlatformStackNavigationRouterOptions;

type FullScreenNavigatorProps<TStackParams extends ParamListBase> = DefaultNavigatorOptions<
    TStackParams,
    PlatformStackNavigationState<TStackParams>,
    PlatformStackNavigationOptions,
    PlatformStackNavigationEventMap
>;

export type {FullScreenNavigatorProps, FullScreenNavigatorRouterOptions};
